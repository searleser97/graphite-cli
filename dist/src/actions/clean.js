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
exports.cleanAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const prompts_1 = __importDefault(require("prompts"));
const onto_1 = require("../actions/onto");
const regen_1 = require("../actions/regen");
const errors_1 = require("../lib/errors");
const log_1 = require("../lib/log");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
function cleanAction(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (utils_1.uncommittedChanges()) {
            throw new errors_1.PreconditionsFailedError("Cannot clean with uncommitted changes");
        }
        const oldBranch = preconditions_1.currentBranchPrecondition();
        const trunk = utils_1.getTrunk().name;
        const oldBranchName = oldBranch.name;
        utils_1.checkoutBranch(trunk);
        if (opts.pull) {
            utils_1.gpExecSync({ command: `git pull` }, () => {
                utils_1.checkoutBranch(oldBranchName);
                throw new errors_1.ExitFailedError(`Failed to pull trunk ${trunk}`);
            });
        }
        const trunkChildren = yield new branch_1.default(trunk).getChildrenFromMeta();
        do {
            const branch = trunkChildren.pop();
            const children = yield branch.getChildrenFromMeta();
            if (!shouldDeleteBranch(branch.name)) {
                continue;
            }
            for (const child of children) {
                utils_1.checkoutBranch(child.name);
                log_1.log(`upstacking (${child.name}) onto (${trunk})`);
                yield onto_1.ontoAction(trunk, true);
                trunkChildren.push(child);
            }
            utils_1.checkoutBranch(trunk);
            yield deleteBranch(Object.assign({ branchName: branch.name }, opts));
            yield regen_1.regenAction(true);
        } while (trunkChildren.length > 0);
        utils_1.checkoutBranch(oldBranchName);
    });
}
exports.cleanAction = cleanAction;
function shouldDeleteBranch(branchName) {
    const trunk = utils_1.getTrunk().name;
    const cherryCheckProvesMerged = child_process_1.execSync(`mergeBase=$(git merge-base ${trunk} ${branchName}) && git cherry ${trunk} $(git commit-tree $(git rev-parse "${branchName}^{tree}") -p $mergeBase -m _)`)
        .toString()
        .trim()
        .startsWith("-");
    if (cherryCheckProvesMerged) {
        return true;
    }
    const diffCheckProvesMerged = child_process_1.execSync(`git diff ${branchName} ${trunk} | wc -l`).toString().trim() ===
        "0";
    if (diffCheckProvesMerged) {
        return true;
    }
    return false;
}
function deleteBranch(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!opts.force) {
            const response = yield prompts_1.default({
                type: "confirm",
                name: "value",
                message: `Delete (${chalk_1.default.green(opts.branchName)}), which has been merged into (${utils_1.getTrunk().name})?`,
                initial: true,
            });
            if (response.value != true) {
                return;
            }
        }
        else {
            log_1.log(`Deleting ${opts.branchName}`, opts);
        }
        child_process_1.execSync(`git branch -D ${opts.branchName}`);
    });
}
//# sourceMappingURL=clean.js.map