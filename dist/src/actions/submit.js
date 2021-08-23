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
exports.submitAction = void 0;
const graphite_cli_routes_1 = __importDefault(require("@screenplaydev/graphite-cli-routes"));
const retyped_routes_1 = require("@screenplaydev/retyped-routes");
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const prompts_1 = __importDefault(require("prompts"));
const tmp_1 = __importDefault(require("tmp"));
const api_1 = require("../lib/api");
const config_1 = require("../lib/config");
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const pr_templates_1 = require("../lib/utils/pr_templates");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
const commit_1 = __importDefault(require("../wrapper-classes/commit"));
const validate_1 = require("./validate");
function submitAction(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const cliAuthToken = getCLIAuthToken();
        const repoName = config_1.repoConfig.getRepoName();
        const repoOwner = config_1.repoConfig.getRepoOwner();
        try {
            validate_1.validate(args.scope);
        }
        catch (_a) {
            throw new errors_1.ValidationFailedError(`Validation failed before submitting.`);
        }
        const currentBranch = preconditions_1.currentBranchPrecondition();
        const branchesToSubmit = yield getBranchesToSubmit(currentBranch);
        pushBranchesToRemote(branchesToSubmit);
        const submittedPRInfo = yield submitPRsForBranches({
            branches: branchesToSubmit,
            cliAuthToken: cliAuthToken,
            repoOwner: repoOwner,
            repoName: repoName,
            editPRFieldsInline: args.editPRFieldsInline,
            createNewPRsAsDraft: args.createNewPRsAsDraft,
        });
        if (submittedPRInfo === null) {
            throw new errors_1.ExitFailedError("Failed to submit commits. Please try again.");
        }
        printSubmittedPRInfo(submittedPRInfo.prs);
        saveBranchPRInfo(submittedPRInfo.prs);
    });
}
exports.submitAction = submitAction;
function getCLIAuthToken() {
    const token = config_1.userConfig.getAuthToken();
    if (!token || token.length === 0) {
        throw new errors_1.PreconditionsFailedError("Please authenticate your Graphite CLI by visiting https://app.graphite.dev/activate.");
    }
    return token;
}
function getBranchesToSubmit(currentBranch) {
    return __awaiter(this, void 0, void 0, function* () {
        const stackOfBranches = yield getDownstackInclusive(currentBranch);
        if (stackOfBranches.length === 0) {
            utils_1.logWarn("No downstack branches found.");
            return [];
        }
        return stackOfBranches.filter((branch) => {
            return branch.getCommitSHAs().length > 0;
        });
    });
}
function getDownstackInclusive(topOfStack) {
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
function pushBranchesToRemote(branches) {
    utils_1.logInfo("Pushing branches to remote...");
    utils_1.logNewline();
    branches.forEach((branch) => {
        utils_1.logInfo(`Pushing ${branch.name}...`);
        utils_1.gpExecSync({
            command: `git push origin -f ${branch.name}`,
        }, (_) => {
            throw new errors_1.ExitFailedError(`Failed to push changes for ${branch.name} to origin. Aborting...`);
        });
        utils_1.logNewline();
    });
}
function submitPRsForBranches(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const branchPRInfo = [];
        for (const branch of args.branches) {
            // The branch here should always have a parent - above, the branches we've
            // gathered should exclude trunk which ensures that every branch we're submitting
            // a PR for has a valid parent.
            const parentBranchName = branch.getParentFromMeta().name;
            const previousPRInfo = branch.getPRInfo();
            if (previousPRInfo) {
                branchPRInfo.push({
                    action: "update",
                    head: branch.name,
                    base: parentBranchName,
                    prNumber: previousPRInfo.number,
                });
            }
            else {
                const { title, body, draft } = yield getPRCreationInfo({
                    branch: branch,
                    parentBranchName: parentBranchName,
                    editPRFieldsInline: args.editPRFieldsInline,
                    createNewPRsAsDraft: args.createNewPRsAsDraft,
                });
                branchPRInfo.push({
                    action: "create",
                    head: branch.name,
                    base: parentBranchName,
                    title: title,
                    body: body,
                    draft: draft,
                });
            }
        }
        try {
            const response = yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.submitPullRequests, {
                authToken: args.cliAuthToken,
                repoOwner: args.repoOwner,
                repoName: args.repoName,
                prs: branchPRInfo,
            });
            if (response._response.status === 200 && response._response.body !== null) {
                return response;
            }
            if (response._response.status === 401) {
                throw new errors_1.PreconditionsFailedError("invalid/expired Graphite auth token.\n\nPlease obtain a new auth token by visiting https://app.graphite.dev/activate.");
            }
            throw new errors_1.ExitFailedError(`unexpected server response (${response._response.status}).\n\nResponse: ${JSON.stringify(response)}`);
        }
        catch (error) {
            throw new errors_1.ExitFailedError(`Failed to submit PRs: ${error.message}`);
        }
    });
}
function getPRCreationInfo(args) {
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.logInfo(`Creating Pull Request for ${chalk_1.default.yellow(args.branch.name)} ▸ ${args.parentBranchName}:`);
        let title = inferPRTitle(args.branch);
        if (args.editPRFieldsInline) {
            const response = yield prompts_1.default({
                type: "text",
                name: "title",
                message: "Title",
                initial: title,
            });
            title = response.title;
        }
        let body = yield pr_templates_1.getPRTemplate();
        const hasPRTemplate = body !== undefined;
        if (args.editPRFieldsInline) {
            const response = yield prompts_1.default({
                type: "select",
                name: "body",
                message: "Body",
                choices: [
                    { title: "Edit Body (using vim)", value: "edit" },
                    {
                        title: `Skip${hasPRTemplate ? ` (just paste template)` : ""}`,
                        value: "skip",
                    },
                ],
            });
            if (response.body === "edit") {
                body = yield editPRBody(body !== null && body !== void 0 ? body : "");
            }
        }
        let draft;
        if (args.createNewPRsAsDraft === undefined) {
            const response = yield prompts_1.default({
                type: "select",
                name: "draft",
                message: "Submit",
                choices: [
                    { title: "Publish Pull Request", value: "publish" },
                    { title: "Create Draft Pull Request", value: "draft" },
                ],
            });
            draft = response.draft === "draft" ? true : false;
        }
        else {
            draft = args.createNewPRsAsDraft;
        }
        // Log newline at the end to create some visual separation to the next
        // interactive PR section or status output.
        utils_1.logNewline();
        return {
            title: title,
            body: body,
            draft: draft,
        };
    });
}
function inferPRTitle(branch) {
    // Only infer the title from the commit if the branch has just 1 commit.
    const singleCommitMessage = getSingleCommitMessageOnBranch(branch);
    if (singleCommitMessage !== null) {
        return singleCommitMessage;
    }
    return `Merge ${branch.name} into ${branch.getParentFromMeta().name}`;
}
function getSingleCommitMessageOnBranch(branch) {
    const commits = branch.getCommitSHAs();
    if (commits.length !== 1) {
        return null;
    }
    const commit = new commit_1.default(commits[0]);
    const commitMessage = commit.message();
    return commitMessage.length > 0 ? commitMessage : null;
}
function editPRBody(initial) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = tmp_1.default.fileSync();
        fs_extra_1.default.writeFileSync(file.name, initial);
        child_process_1.execSync(`\${GIT_EDITOR:-vi} ${file.name}`, { stdio: "inherit" });
        const contents = fs_extra_1.default.readFileSync(file.name).toString();
        file.removeCallback();
        return contents;
    });
}
function printSubmittedPRInfo(prs) {
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
                assertUnreachable(pr);
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
function saveBranchPRInfo(prs) {
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
function assertUnreachable(arg) { }
//# sourceMappingURL=submit.js.map