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
const graphite_cli_routes_1 = __importDefault(require("@screenplaydev/graphite-cli-routes"));
const retyped_routes_1 = require("@screenplaydev/retyped-routes");
const chalk_1 = __importDefault(require("chalk"));
const validate_1 = require("../../../actions/validate");
const abstract_command_1 = __importDefault(require("../../../lib/abstract_command"));
const api_1 = require("../../../lib/api");
const utils_1 = require("../../../lib/utils");
const branch_1 = __importDefault(require("../../../wrapper-classes/branch"));
const print_stacks_1 = __importDefault(require("../print-stacks"));
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
        return __awaiter(this, void 0, void 0, function* () {
            const cliAuthToken = this.getCLIAuthToken();
            const { repoName, repoOwner } = this.getRepoNameAndOwner();
            try {
                yield validate_1.validate("FULLSTACK", true);
            }
            catch (_a) {
                yield new print_stacks_1.default().executeUnprofiled(argv);
                throw new Error(`Validation failed before submitting.`);
            }
            const currentBranch = branch_1.default.getCurrentBranch();
            if (currentBranch === undefined || currentBranch === null) {
                utils_1.logWarn("No current stack to submit.");
                return;
            }
            const stackOfBranches = yield this.getDownstackInclusive(currentBranch);
            if (stackOfBranches.length === 0) {
                utils_1.logWarn("No downstack branches found.");
                return;
            }
            this.pushBranchesToRemote(stackOfBranches);
            const submittedPRInfo = yield this.submitPRsForBranches({
                branches: stackOfBranches,
                cliAuthToken: cliAuthToken,
                repoOwner: repoOwner,
                repoName: repoName,
            });
            if (submittedPRInfo === null) {
                utils_1.logErrorAndExit("Failed to submit commits. Please try again.");
            }
            this.printSubmittedPRInfo(submittedPRInfo.prs);
            this.saveBranchPRInfo(submittedPRInfo.prs);
        });
    }
    getCLIAuthToken() {
        const token = utils_1.userConfig.authToken;
        if (!token || token.length === 0) {
            utils_1.logErrorAndExit("Please authenticate your Graphite CLI by visiting https://app.graphite.dev/activate.");
        }
        return token;
    }
    getRepoNameAndOwner() {
        if (utils_1.repoConfig.repoName && utils_1.repoConfig.owner) {
            return {
                repoName: utils_1.repoConfig.repoName,
                repoOwner: utils_1.repoConfig.owner,
            };
        }
        const repoInfo = this.inferRepoGitHubInfo();
        if (repoInfo !== null) {
            return {
                repoName: repoInfo.repoName,
                repoOwner: repoInfo.repoOwner,
            };
        }
        utils_1.logErrorAndExit("Could not infer repoName and/or repo owner. Please fill out these fields in your repo's copy of .graphite_repo_config.");
    }
    getDownstackInclusive(topOfStack) {
        return __awaiter(this, void 0, void 0, function* () {
            const downstack = [];
            let currentBranch = topOfStack;
            while (currentBranch != null &&
                currentBranch != undefined &&
                // don't include trunk as part of the stack
                currentBranch.getParentFromMeta() != undefined) {
                downstack.push(currentBranch);
                const parentBranchName = currentBranch.getParentFromMeta().name;
                currentBranch = yield branch_1.default.branchWithName(parentBranchName);
            }
            downstack.reverse();
            return downstack;
        });
    }
    inferRepoGitHubInfo() {
        // This assumes that the remote to use is named 'origin' and that the remote
        // to fetch from is the same as the remote to push to. If a user runs into
        // an issue where any of these invariants are not true, they can manually
        // edit the repo config file to overrule what our CLI tries to intelligently
        // infer.
        const url = utils_1.gpExecSync({
            command: `git config --get remote.origin.url`,
        }, (_) => {
            return Buffer.alloc(0);
        })
            .toString()
            .trim();
        if (!url || url.length === 0) {
            return null;
        }
        let regex = undefined;
        if (url.startsWith("git@github.com")) {
            regex = /git@github.com:([^/]+)\/(.+)?.git/;
        }
        else if (url.startsWith("https://")) {
            regex = /https:\/\/github.com\/([^/]+)\/(.+)?.git/;
        }
        else {
            return null;
        }
        // e.g. in screenplaydev/graphite-cli we're trying to get the owner
        // ('screenplaydev') and the repo name ('graphite-cli')
        const matches = regex.exec(url);
        const owner = matches === null || matches === void 0 ? void 0 : matches[1];
        const name = matches === null || matches === void 0 ? void 0 : matches[2];
        if (owner === undefined || name === undefined) {
            return null;
        }
        return {
            repoOwner: owner,
            repoName: name,
        };
    }
    pushBranchesToRemote(branches) {
        utils_1.logInfo("Pushing branches to remote...");
        utils_1.logNewline();
        branches.forEach((branch) => {
            utils_1.logInfo(`Pushing ${branch.name}...`);
            utils_1.gpExecSync({
                command: `git push origin -f ${branch.name}`,
            }, (_) => {
                utils_1.logInternalErrorAndExit(`Failed to push changes for ${branch.name} to origin. Aborting...`);
            });
            utils_1.logNewline();
        });
    }
    submitPRsForBranches(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const branchPRInfo = [];
            args.branches.forEach((branch) => {
                // The branch here should always have a parent - above, the branches we've
                // gathered should exclude trunk which ensures that every branch we're submitting
                // a PR for has a valid parent.
                const parentBranchName = branch.getParentFromMeta().name;
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
                        // Default placeholder title.
                        // TODO (nicholasyan): improve this by using the commit message if the
                        // branch only has 1 commit.
                        title: `Merge ${branch.name} into ${parentBranchName}`,
                    });
                }
            });
            try {
                const response = yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.submitPullRequests, {
                    authToken: args.cliAuthToken,
                    repoOwner: args.repoOwner,
                    repoName: args.repoName,
                    prs: branchPRInfo,
                });
                if (response._response.status !== 200 ||
                    response._response.body === null) {
                    return null;
                }
                return response;
            }
            catch (error) {
                return null;
            }
        });
    }
    printSubmittedPRInfo(prs) {
        prs.forEach((pr) => {
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
            }
            utils_1.logNewline();
        });
    }
    saveBranchPRInfo(prs) {
        prs.forEach((pr) => __awaiter(this, void 0, void 0, function* () {
            if (pr.status === "updated" || pr.status === "created") {
                const branch = yield branch_1.default.branchWithName(pr.head);
                branch.setPRInfo({
                    number: pr.prNumber,
                    url: pr.prURL,
                });
            }
        }));
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    assertUnreachable(arg) { }
}
exports.default = SubmitCommand;
SubmitCommand.args = args;
//# sourceMappingURL=index.js.map