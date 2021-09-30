"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncAction = void 0;
const prompts_1 = __importDefault(require("prompts"));
const config_1 = require("../lib/config");
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const pr_info_1 = require("../lib/sync/pr_info");
const utils_1 = require("../lib/utils");
const splog_1 = require("../lib/utils/splog");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
const metadata_ref_1 = __importDefault(require("../wrapper-classes/metadata_ref"));
const clean_branches_1 = require("./clean_branches");
const fix_dangling_branches_1 = require("./fix_dangling_branches");
const submit_1 = require("./submit");
function syncAction(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (utils_1.uncommittedChanges()) {
            throw new errors_1.PreconditionsFailedError("Cannot sync with uncommitted changes");
        }
        const oldBranch = preconditions_1.currentBranchPrecondition();
        const trunk = utils_1.getTrunk().name;
        utils_1.checkoutBranch(trunk);
        if (opts.pull) {
            splog_1.logNewline();
            utils_1.logInfo(`Pulling in new changes...`);
            splog_1.logTip(`Disable this behavior at any point in the future with --no-pull`);
            utils_1.gpExecSync({ command: `git pull` }, (err) => {
                utils_1.checkoutBranch(oldBranch.name);
                throw new errors_1.ExitFailedError(`Failed to pull trunk ${trunk}`, err);
            });
        }
        yield pr_info_1.syncPRInfoForBranches(branch_1.default.allBranches());
        // This needs to happen before we delete/resubmit so that we can potentially
        // delete or resubmit on the dangling branches.
        if (opts.fixDanglingBranches) {
            splog_1.logNewline();
            utils_1.logInfo(`Ensuring tracked branches in Graphite are all well-formed...`);
            splog_1.logTip(`Disable this behavior at any point in the future with --no-show-dangling`);
            yield fix_dangling_branches_1.fixDanglingBranches(opts.force);
        }
        if (opts.delete) {
            splog_1.logNewline();
            utils_1.logInfo(`Checking if any branches have been merged and can be deleted...`);
            splog_1.logTip(`Disable this behavior at any point in the future with --no-delete`);
            yield clean_branches_1.deleteMergedBranches({
                force: opts.force,
                showDeleteProgress: opts.showDeleteProgress,
            });
        }
        if (opts.resubmit) {
            yield resubmitBranchesWithNewBases(opts.force);
        }
        utils_1.checkoutBranch(branch_1.default.exists(oldBranch.name) ? oldBranch.name : trunk);
        cleanDanglingMetadata();
    });
}
exports.syncAction = syncAction;
function cleanDanglingMetadata() {
    const allMetadataRefs = metadata_ref_1.default.allMetadataRefs();
    const allBranches = branch_1.default.allBranches();
    allMetadataRefs.forEach((ref) => {
        if (!allBranches.find((b) => b.name === ref._branchName)) {
            splog_1.logDebug(`Deleting metadata for ${ref._branchName}`);
            ref.delete();
        }
    });
}
function resubmitBranchesWithNewBases(force) {
    return __awaiter(this, void 0, void 0, function* () {
        const needsResubmission = [];
        branch_1.default.allBranchesWithFilter({
            filter: (b) => {
                var _a;
                const prState = (_a = b.getPRInfo()) === null || _a === void 0 ? void 0 : _a.state;
                return (!b.isTrunk() &&
                    b.getParentFromMeta() !== undefined &&
                    prState !== "MERGED" &&
                    prState !== "CLOSED");
            },
        }).forEach((b) => {
            var _a, _b;
            const currentBase = (_a = b.getParentFromMeta()) === null || _a === void 0 ? void 0 : _a.name;
            const githubBase = (_b = b.getPRInfo()) === null || _b === void 0 ? void 0 : _b.base;
            if (githubBase && githubBase !== currentBase) {
                needsResubmission.push(b);
            }
        });
        if (needsResubmission.length === 0) {
            return;
        }
        splog_1.logNewline();
        utils_1.logInfo([
            `Detected merge bases changes for:`,
            ...needsResubmission.map((b) => `- ${b.name}`),
        ].join("\n"));
        splog_1.logTip(`Disable this behavior at any point in the future with --no-resubmit`);
        // Prompt for resubmission.
        let resubmit = force;
        if (!force) {
            const response = yield prompts_1.default({
                type: "confirm",
                name: "value",
                message: `Update remote PR mergebases to match local?`,
                initial: true,
            });
            resubmit = response.value;
        }
        if (resubmit) {
            utils_1.logInfo(`Updating outstanding PR mergebases...`);
            const cliAuthToken = preconditions_1.cliAuthPrecondition();
            const repoName = config_1.repoConfig.getRepoName();
            const repoOwner = config_1.repoConfig.getRepoOwner();
            yield submit_1.submitBranches({
                branchesToSubmit: needsResubmission,
                cliAuthToken: cliAuthToken,
                repoOwner: repoOwner,
                repoName: repoName,
                editPRFieldsInline: false,
                createNewPRsAsDraft: false,
            });
        }
    });
}
//# sourceMappingURL=sync.js.map