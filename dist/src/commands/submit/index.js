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
const chalk_1 = __importDefault(require("chalk"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const utils_1 = require("../../lib/utils");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const abstract_command_1 = __importDefault(require("../abstract_command"));
const print_stacks_1 = __importDefault(require("../print-stacks"));
const validate_1 = __importDefault(require("../validate"));
const args = {
    silent: {
        describe: `silence output from the command`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "s",
    },
    "from-commits": {
        describe: "The name of the target which builds your app for release",
        demandOption: false,
        type: "boolean",
        default: false,
    },
    fill: {
        describe: "Do not prompt for title/body and just use commit info",
        demandOption: false,
        type: "boolean",
        default: false,
        alias: "f",
    },
};
class SubmitCommand extends abstract_command_1.default {
    _execute(argv) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const cliAuthToken = utils_1.userConfig.authToken;
            if (!cliAuthToken || cliAuthToken.length === 0) {
                utils_1.logErrorAndExit("Please authenticate the Graphite CLI by visiting https://app.graphite.dev/activate.");
            }
            const repoName = utils_1.repoConfig.repoName;
            const repoOwner = utils_1.repoConfig.owner;
            if (repoName === undefined || repoOwner === undefined) {
                utils_1.logErrorAndExit("Could not infer repoName and/or repo owner. Please fill out these fields in your repo's copy of .graphite_repo_config.");
            }
            try {
                yield new validate_1.default().executeUnprofiled({ silent: true });
            }
            catch (_b) {
                yield new print_stacks_1.default().executeUnprofiled(argv);
                throw new Error(`Validation failed before submitting.`);
            }
            let currentBranch = branch_1.default.getCurrentBranch();
            const stackOfBranches = [];
            while (currentBranch != null &&
                currentBranch != undefined &&
                currentBranch.getParentFromMeta() != undefined // dont put up pr for a base branch like "main"
            ) {
                stackOfBranches.push(currentBranch);
                const parentBranchName = (_a = currentBranch.getParentFromMeta()) === null || _a === void 0 ? void 0 : _a.name;
                currentBranch =
                    parentBranchName !== undefined
                        ? yield branch_1.default.branchWithName(parentBranchName)
                        : undefined;
            }
            // Create PR's for oldest branches first.
            stackOfBranches.reverse();
            const branchPRInfo = [];
            utils_1.logInfo("Pushing branches to remote...");
            utils_1.logNewline();
            stackOfBranches.forEach((branch, i) => {
                var _a;
                utils_1.logInfo(`Pushing ${branch.name}...`);
                utils_1.gpExecSync({
                    command: `git push origin -f ${branch.name}`,
                }, (_) => {
                    utils_1.logInternalErrorAndExit(`Failed to push changes for ${branch.name} to origin. Aborting...`);
                });
                utils_1.logNewline();
                const parentBranchName = (_a = branch.getParentFromMeta()) === null || _a === void 0 ? void 0 : _a.name;
                // This should never happen - above, we should've verified that we aren't
                // pushing the trunk branch and thus that every branch we're creating a PR
                // for has a valid parent branch.
                if (parentBranchName === undefined) {
                    utils_1.logInternalErrorAndExit(`Failed to find base branch for ${branch.name}. Aborting...`);
                }
                const prInfo = branch.getPRInfo();
                if (prInfo) {
                    branchPRInfo.push({
                        action: "update",
                        head: branch.name,
                        base: parentBranchName,
                        prNumber: prInfo.number,
                    });
                }
                else {
                    branchPRInfo.push({
                        action: "create",
                        head: branch.name,
                        base: parentBranchName,
                        title: `Merge ${branch.name} into ${parentBranchName}`,
                    });
                }
            });
            try {
                yield node_fetch_1.default("https://api.graphite.dev/v1/graphite/submit/pull-requests", {
                    method: "POST",
                    body: JSON.stringify({
                        authToken: cliAuthToken,
                        repoOwner: repoOwner,
                        repoName: repoName,
                        prs: branchPRInfo,
                    }),
                    headers: {
                        "Content-Type": "text/plain",
                    },
                }).then((response) => {
                    if (response.status === 200 && response.body !== null) {
                        utils_1.logInfo("Submitting PRs...");
                        utils_1.logNewline();
                        response.json().then((body) => {
                            body.prs.forEach((pr) => {
                                utils_1.logSuccess(pr.head);
                                let status = pr.status;
                                switch (pr.status) {
                                    case "updated":
                                        status = chalk_1.default.yellow(status);
                                        break;
                                    case "created":
                                        status = chalk_1.default.green(status);
                                        break;
                                    case "error":
                                        status = chalk_1.default.red(status);
                                        break;
                                    default:
                                        this.assertUnreachable(pr);
                                }
                                if ("error" in pr) {
                                    utils_1.logError(pr.error);
                                }
                                else {
                                    console.log(`${pr.prURL} (${status})`);
                                    branch_1.default.branchWithName(pr.head).then((branch) => {
                                        branch.setPRInfo({
                                            number: pr.prNumber,
                                            url: pr.prURL,
                                        });
                                    });
                                }
                                utils_1.logNewline();
                            });
                        });
                    }
                    else {
                        utils_1.logErrorAndExit("Failed to submit commits. Please try again.");
                    }
                });
            }
            catch (error) {
                utils_1.logErrorAndExit("Failed to submit commits. Please try again.");
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    assertUnreachable(arg) { }
}
exports.default = SubmitCommand;
SubmitCommand.args = args;
//# sourceMappingURL=index.js.map