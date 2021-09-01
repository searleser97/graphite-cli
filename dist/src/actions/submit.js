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
exports.saveBranchPRInfo = exports.submitPRsForBranches = exports.submitAction = void 0;
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
const default_editor_1 = require("../lib/utils/default_editor");
const pr_templates_1 = require("../lib/utils/pr_templates");
const wrapper_classes_1 = require("../wrapper-classes");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
const commit_1 = __importDefault(require("../wrapper-classes/commit"));
const validate_1 = require("./validate");
function submitAction(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config_1.execStateConfig.interactive()) {
            args.editPRFieldsInline = false;
            args.createNewPRsAsDraft = true;
        }
        const cliAuthToken = preconditions_1.cliAuthPrecondition();
        const repoName = config_1.repoConfig.getRepoName();
        const repoOwner = config_1.repoConfig.getRepoOwner();
        try {
            if (args.scope !== "BRANCH") {
                validate_1.validate(args.scope);
            }
        }
        catch (_a) {
            throw new errors_1.ValidationFailedError(`Validation failed before submitting.`);
        }
        const branchesToSubmit = getBranchesToSubmit({
            currentBranch: preconditions_1.currentBranchPrecondition(),
            scope: args.scope,
        });
        const branchesPushedToRemote = pushBranchesToRemote(branchesToSubmit);
        const submittedPRInfo = yield submitPRsForBranches({
            branches: branchesToSubmit,
            branchesPushedToRemote: branchesPushedToRemote,
            cliAuthToken: cliAuthToken,
            repoOwner: repoOwner,
            repoName: repoName,
            editPRFieldsInline: args.editPRFieldsInline,
            createNewPRsAsDraft: args.createNewPRsAsDraft,
        });
        if (submittedPRInfo === null) {
            throw new errors_1.ExitFailedError("Failed to submit commits. Please try again.");
        }
        printSubmittedPRInfo(submittedPRInfo);
        saveBranchPRInfo(submittedPRInfo);
    });
}
exports.submitAction = submitAction;
function getBranchesToSubmit(args) {
    switch (args.scope) {
        case "DOWNSTACK":
            return new wrapper_classes_1.MetaStackBuilder()
                .downstackFromBranch(args.currentBranch)
                .branches()
                .filter((b) => !b.isTrunk());
        case "FULLSTACK":
            return new wrapper_classes_1.MetaStackBuilder()
                .fullStackFromBranch(args.currentBranch)
                .branches()
                .filter((b) => !b.isTrunk());
        case "UPSTACK":
            return new wrapper_classes_1.MetaStackBuilder()
                .upstackInclusiveFromBranchWithParents(args.currentBranch)
                .branches()
                .filter((b) => !b.isTrunk());
        case "BRANCH":
            return [args.currentBranch];
        default:
            assertUnreachable(args.scope);
            return [];
    }
}
function pushBranchesToRemote(branches) {
    const branchesPushedToRemote = [];
    utils_1.logInfo("Pushing branches to remote...");
    utils_1.logNewline();
    branches.forEach((branch) => {
        utils_1.logInfo(`Pushing ${branch.name}...`);
        const output = utils_1.gpExecSync({
            // redirecting stderr to stdout here because 1) git prints the output
            // of the push command to stderr 2) we want to analyze it but Node's
            // execSync makes analyzing stderr extremely challenging
            command: `git push origin -f ${branch.name} 2>&1`,
            options: {
                printStdout: true,
            },
        }, (err) => {
            throw new errors_1.ExitFailedError(`Failed to push changes for ${branch.name} to origin. Aborting...`, err);
        })
            .toString()
            .trim();
        if (!output.includes("Everything up-to-date")) {
            branchesPushedToRemote.push(branch);
        }
    });
    return branchesPushedToRemote;
}
function submitPRsForBranches(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const branchPRInfo = [];
        for (const branch of args.branches) {
            // The branch here should always have a parent - above, the branches we've
            // gathered should exclude trunk which ensures that every branch we're submitting
            // a PR for has a valid parent.
            const parentBranchName = getBranchBaseName(branch);
            const previousPRInfo = branch.getPRInfo();
            if (previousPRInfo === undefined) {
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
            else if (shouldUpdatePR({
                branch: branch,
                previousBranchPRInfo: previousPRInfo,
                branchesPushedToRemote: args.branchesPushedToRemote,
            })) {
                branchPRInfo.push({
                    action: "update",
                    head: branch.name,
                    base: parentBranchName,
                    prNumber: previousPRInfo.number,
                });
            }
        }
        if (branchPRInfo.length === 0) {
            return [];
        }
        try {
            const response = yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.submitPullRequests, {
                authToken: args.cliAuthToken,
                repoOwner: args.repoOwner,
                repoName: args.repoName,
                prs: branchPRInfo,
            });
            if (response._response.status === 200 && response._response.body !== null) {
                const requests = {};
                branchPRInfo.forEach((prRequest) => {
                    requests[prRequest.head] = prRequest;
                });
                return response.prs.map((prResponse) => {
                    return {
                        request: requests[prResponse.head],
                        response: prResponse,
                    };
                });
            }
            if (response._response.status === 401) {
                throw new errors_1.PreconditionsFailedError("invalid/expired Graphite auth token.\n\nPlease obtain a new auth token by visiting https://app.graphite.dev/activate.");
            }
            throw new errors_1.ExitFailedError(`unexpected server response (${response._response.status}).\n\nResponse: ${JSON.stringify(response)}`);
        }
        catch (error) {
            throw new errors_1.ExitFailedError(`Failed to submit PRs`, error);
        }
    });
}
exports.submitPRsForBranches = submitPRsForBranches;
function getBranchBaseName(branch) {
    return branch.getParentFromMeta().name;
}
/**
 * For now, we only allow users to update the following PR properties which
 * necessitate a PR update:
 * - the PR base
 * - the PR's code contents
 *
 * Notably, we do not yet allow users to update the PR title, body, etc.
 *
 * Therefore, we should only update the PR iff either of these properties
 * differ from our stored data on the previous PR submission.
 */
function shouldUpdatePR(args) {
    // base was updated
    if (getBranchBaseName(args.branch) !== args.previousBranchPRInfo.base) {
        return true;
    }
    // code was updated
    if (args.branchesPushedToRemote.find((branchPushedToRemote) => branchPushedToRemote.name === args.branch.name)) {
        return true;
    }
    if (config_1.execStateConfig.outputDebugLogs()) {
        utils_1.logInfo(`No PR update needed for ${args.branch.name}: PR base and code unchanged.`);
    }
    return false;
}
function getPRCreationInfo(args) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.logInfo(`Creating Pull Request for ${chalk_1.default.yellow(args.branch.name)} ▸ ${args.parentBranchName}:`);
        let title = inferPRTitle(args.branch);
        if (args.editPRFieldsInline) {
            const response = yield prompts_1.default({
                type: "text",
                name: "title",
                message: "Title",
                initial: title,
            }, {
                onCancel: () => {
                    throw new errors_1.KilledError();
                },
            });
            title = (_a = response.title) !== null && _a !== void 0 ? _a : title;
        }
        let body = yield pr_templates_1.getPRTemplate();
        const hasPRTemplate = body !== undefined;
        if (args.editPRFieldsInline) {
            const defaultEditor = default_editor_1.getDefaultEditor();
            const response = yield prompts_1.default({
                type: "select",
                name: "body",
                message: "Body",
                choices: [
                    { title: `Edit Body (using ${defaultEditor})`, value: "edit" },
                    {
                        title: `Skip${hasPRTemplate ? ` (just paste template)` : ""}`,
                        value: "skip",
                    },
                ],
            }, {
                onCancel: () => {
                    throw new errors_1.KilledError();
                },
            });
            if (response.body === "edit") {
                body = yield editPRBody({
                    initial: body !== null && body !== void 0 ? body : "",
                    editor: defaultEditor,
                });
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
            }, {
                onCancel: () => {
                    throw new errors_1.KilledError();
                },
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
function editPRBody(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = tmp_1.default.fileSync();
        fs_extra_1.default.writeFileSync(file.name, args.initial);
        child_process_1.execSync(`${args.editor} ${file.name}`, { stdio: "inherit" });
        const contents = fs_extra_1.default.readFileSync(file.name).toString();
        file.removeCallback();
        return contents;
    });
}
function printSubmittedPRInfo(prs) {
    if (prs.length === 0) {
        utils_1.logInfo("All PRs up-to-date on GitHub; no PR updates necessary.");
        return;
    }
    prs.forEach((pr) => {
        utils_1.logSuccess(pr.response.head);
        let status = pr.response.status;
        switch (pr.response.status) {
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
                assertUnreachable(pr.response);
        }
        if ("error" in pr.response) {
            utils_1.logError(pr.response.error);
        }
        else {
            console.log(`${pr.response.prURL} (${status})`);
        }
        utils_1.logNewline();
        utils_1.logInfo(`See your full stack on "app.graphite.dev"`);
    });
}
function saveBranchPRInfo(prs) {
    prs.forEach((pr) => __awaiter(this, void 0, void 0, function* () {
        if (pr.response.status === "updated" || pr.response.status === "created") {
            const branch = yield branch_1.default.branchWithName(pr.response.head);
            branch.setPRInfo({
                number: pr.response.prNumber,
                url: pr.response.prURL,
                base: pr.request.base,
            });
        }
    }));
}
exports.saveBranchPRInfo = saveBranchPRInfo;
// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg) { }
//# sourceMappingURL=submit.js.map