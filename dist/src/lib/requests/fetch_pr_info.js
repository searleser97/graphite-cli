#!/usr/bin/env node
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
exports.refreshPRInfoInBackground = void 0;
const graphite_cli_routes_1 = __importDefault(require("@screenplaydev/graphite-cli-routes"));
const retyped_routes_1 = require("@screenplaydev/retyped-routes");
const child_process_1 = __importDefault(require("child_process"));
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const api_1 = require("../api");
const config_1 = require("../config");
function refreshPRInfoInBackground() {
    // do our potential write before we kick off the child process so that we
    // don't incur a possible race condition with the write
    const now = Date.now();
    const lastFetchedMs = config_1.repoConfig.getLastFetchedPRInfoMs();
    const msInSecond = 1000;
    // rate limit refreshing PR info to once per minute
    if (lastFetchedMs === undefined || now - lastFetchedMs > 60 * msInSecond) {
        config_1.repoConfig.setLastFetchedPRInfoMs(now);
        child_process_1.default.spawn("/usr/bin/env", ["node", __filename], {
            detached: true,
            stdio: "ignore",
        });
    }
}
exports.refreshPRInfoInBackground = refreshPRInfoInBackground;
function refreshPRInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authToken = config_1.userConfig.getAuthToken();
            if (authToken === undefined) {
                return;
            }
            const repoName = config_1.repoConfig.getRepoName();
            const repoOwner = config_1.repoConfig.getRepoOwner();
            const branchesWithPRs = branch_1.default.allBranches().filter((branch) => branch.getPRInfo() !== undefined);
            const prNumsToBranches = {};
            branchesWithPRs.forEach((branchWithPR) => (prNumsToBranches[branchWithPR.getPRInfo().number] = branchWithPR));
            const prNums = Object.keys(prNumsToBranches).map((prNumKey) => parseInt(prNumKey));
            const response = yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.pullRequestInfo, {
                authToken: authToken,
                repoName: repoName,
                repoOwner: repoOwner,
                prNumbers: prNums,
            });
            if (response._response.status === 200) {
                response.prs.forEach((pr) => {
                    var _a;
                    const branch = prNumsToBranches[pr.prNumber];
                    branch.setPRInfo({
                        number: pr.prNumber,
                        base: pr.baseRefName,
                        url: pr.url,
                        state: pr.state,
                        title: pr.title,
                        reviewDecision: (_a = pr.reviewDecision) !== null && _a !== void 0 ? _a : undefined,
                        isDraft: pr.isDraft,
                    });
                });
            }
        }
        catch (err) {
            return;
        }
    });
}
if (process.argv[1] === __filename) {
    void refreshPRInfo();
}
//# sourceMappingURL=fetch_pr_info.js.map