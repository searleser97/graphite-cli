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
exports.MAX_COMMITS_TO_TRAVERSE_FOR_NEXT_OR_PREV = void 0;
const child_process_1 = require("child_process");
const config_1 = require("../lib/config");
const errors_1 = require("../lib/errors");
const telemetry_1 = require("../lib/telemetry");
const utils_1 = require("../lib/utils");
const time_1 = require("../lib/utils/time");
const commit_1 = __importDefault(require("./commit"));
exports.MAX_COMMITS_TO_TRAVERSE_FOR_NEXT_OR_PREV = 50;
function gitTreeFromRevListOutput(output) {
    const ret = {};
    for (const line of output.split("\n")) {
        if (line.length > 0) {
            const shas = line.split(" ");
            ret[shas[0]] = shas.slice(1);
        }
    }
    return ret;
}
function branchListFromShowRefOutput(output) {
    const ret = {};
    const ignorebranches = config_1.repoConfig.getIgnoreBranches();
    for (const line of output.split("\n")) {
        if (line.length > 0) {
            const parts = line.split(" ");
            const branchName = parts[1].slice("refs/heads/".length);
            if (!ignorebranches.includes(branchName)) {
                ret[parts[0]] = branchName;
            }
        }
    }
    return ret;
}
function traverseGitTreeFromCommitUntilBranch(commit, gitTree, branchList, n) {
    // Skip the first iteration b/c that is the CURRENT branch
    if (n > 0 && commit in branchList) {
        return new Set([branchList[commit]]);
    }
    // Limit the seach
    if (n > exports.MAX_COMMITS_TO_TRAVERSE_FOR_NEXT_OR_PREV) {
        return new Set();
    }
    if (!gitTree[commit] || gitTree[commit].length == 0) {
        return new Set();
    }
    const commitsMatchingBranches = new Set();
    for (const neighborCommit of gitTree[commit]) {
        const discoveredMatches = traverseGitTreeFromCommitUntilBranch(neighborCommit, gitTree, branchList, n + 1);
        if (discoveredMatches.size !== 0) {
            discoveredMatches.forEach((commit) => {
                commitsMatchingBranches.add(commit);
            });
        }
    }
    return commitsMatchingBranches;
}
class Branch {
    constructor(name) {
        this.name = name;
    }
    toString() {
        return this.name;
    }
    getMeta() {
        try {
            const metaString = child_process_1.execSync(`git cat-file -p refs/branch-metadata/${this.name} 2> /dev/null`)
                .toString()
                .trim();
            if (metaString.length == 0) {
                return undefined;
            }
            // TODO: Better account for malformed desc; possibly validate with retype
            const meta = JSON.parse(metaString);
            return meta;
        }
        catch (_a) {
            return undefined;
        }
    }
    writeMeta(desc) {
        const metaSha = child_process_1.execSync(`git hash-object -w --stdin`, {
            input: JSON.stringify(desc),
        }).toString();
        child_process_1.execSync(`git update-ref refs/branch-metadata/${this.name} ${metaSha}`, {
            stdio: "ignore",
        });
    }
    stackByTracingMetaParents(branch) {
        const curBranch = branch || this;
        const metaParent = curBranch.getParentFromMeta();
        if (metaParent) {
            return this.stackByTracingMetaParents(metaParent).concat([
                curBranch.name,
            ]);
        }
        else {
            return [curBranch.name];
        }
    }
    stackByTracingGitParents(branch) {
        const curBranch = branch || this;
        const gitParents = curBranch.getParentsFromGit();
        if (gitParents.length === 1) {
            return this.stackByTracingGitParents(gitParents[0]).concat([
                curBranch.name,
            ]);
        }
        else {
            return [curBranch.name];
        }
    }
    getParentFromMeta() {
        var _a;
        if (this.name === utils_1.getTrunk().name) {
            return undefined;
        }
        const parentName = (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.parentBranchName;
        if (parentName) {
            if (parentName === this.name) {
                this.clearParentMetadata();
                throw new errors_1.ExitFailedError(`Branch (${this.name}) has itself listed as a parent in the meta. Deleting (${this.name}) parent metadata and exiting.`);
            }
            return new Branch(parentName);
        }
        return undefined;
    }
    static allBranches() {
        return child_process_1.execSync(`git for-each-ref --format='%(refname:short)' refs/heads/`)
            .toString()
            .trim()
            .split("\n")
            .map((name) => new Branch(name));
    }
    getChildrenFromMeta() {
        const children = Branch.allBranches().filter((b) => { var _a; return ((_a = b.getMeta()) === null || _a === void 0 ? void 0 : _a.parentBranchName) === this.name; });
        return children;
    }
    isUpstreamOf(commitRef) {
        const downstreamRef = utils_1.gpExecSync({
            command: `git merge-base ${this.name} ${commitRef}`,
        })
            .toString()
            .trim();
        return downstreamRef !== this.ref();
    }
    ref() {
        return utils_1.gpExecSync({
            command: `git show-ref refs/heads/${this.name} -s`,
        }, (_) => {
            // just soft-fail if we can't find the commits
            return Buffer.alloc(0);
        })
            .toString()
            .trim();
    }
    getMetaMergeBase() {
        const parent = this.getParentFromMeta();
        if (!parent) {
            return undefined;
        }
        const curParentRef = parent.getCurrentRef();
        const prevParentRef = parent.getMetaPrevRef();
        const curParentMergeBase = child_process_1.execSync(`git merge-base ${curParentRef} ${this.name}`)
            .toString()
            .trim();
        if (!prevParentRef) {
            return curParentMergeBase;
        }
        const prevParentMergeBase = child_process_1.execSync(`git merge-base ${prevParentRef} ${this.name}`)
            .toString()
            .trim();
        // The merge base of the two merge bases = the one closer to the trunk.
        // Therefore, the other must be closer or equal to the head of the branch.
        const closestMergeBase = child_process_1.execSync(`git merge-base ${prevParentMergeBase} ${curParentMergeBase}`)
            .toString()
            .trim() === curParentMergeBase
            ? prevParentMergeBase
            : curParentMergeBase;
        return closestMergeBase;
    }
    static exists(branchName) {
        try {
            child_process_1.execSync(`git show-ref --quiet refs/heads/${branchName}`, {
                stdio: "ignore",
            });
        }
        catch (_a) {
            return false;
        }
        return true;
    }
    getMetaPrevRef() {
        var _a;
        return (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.prevRef;
    }
    getCurrentRef() {
        return child_process_1.execSync(`git rev-parse ${this.name}`).toString().trim();
    }
    clearParentMetadata() {
        const meta = this.getMeta() || {};
        delete meta.parentBranchName;
        this.writeMeta(meta);
    }
    setParentBranchName(parentBranchName) {
        const meta = this.getMeta() || {};
        meta.parentBranchName = parentBranchName;
        this.writeMeta(meta);
    }
    setMetaPrevRef(prevRef) {
        const meta = this.getMeta() || {};
        meta.prevRef = prevRef;
        this.writeMeta(meta);
    }
    static branchWithName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const branch = Branch.allBranches().find((b) => b.name === name);
            if (!branch) {
                throw new Error(`Failed to find branch named ${name}`);
            }
            return new Branch(name);
        });
    }
    static getCurrentBranch() {
        const name = utils_1.gpExecSync({
            command: `git rev-parse --abbrev-ref HEAD`,
        }, (e) => {
            return Buffer.alloc(0);
        })
            .toString()
            .trim();
        // When the object we've checked out is a commit (and not a branch),
        // git rev-parse --abbrev-ref HEAD returns 'HEAD'. This isn't a valid
        // branch.
        return name.length > 0 && name !== "HEAD" ? new Branch(name) : null;
    }
    static getAllBranchesWithoutParents() {
        return __awaiter(this, void 0, void 0, function* () {
            return Branch.allBranches().filter((b) => b.getParentsFromGit().length === 0);
        });
    }
    static getAllBranchesWithParents() {
        return __awaiter(this, void 0, void 0, function* () {
            return Branch.allBranches().filter((b) => b.getParentsFromGit().length > 0);
        });
    }
    head() {
        return new commit_1.default(child_process_1.execSync(`git rev-parse ${this.name}`).toString().trim());
    }
    base() {
        var _a;
        const parentBranchName = (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.parentBranchName;
        if (!parentBranchName) {
            return undefined;
        }
        return new commit_1.default(child_process_1.execSync(`git merge-base ${parentBranchName} ${this.name}`)
            .toString()
            .trim());
    }
    getChildrenFromGit() {
        return this.getChildrenOrParents("CHILDREN");
    }
    getParentsFromGit() {
        if (
        // Current branch is trunk
        this.name === utils_1.getTrunk().name
        // Current branch shares
        ) {
            return [];
        }
        else if (this.pointsToSameCommitAs(utils_1.getTrunk())) {
            return [utils_1.getTrunk()];
        }
        return this.getChildrenOrParents("PARENTS");
    }
    pointsToSameCommitAs(branch) {
        return !!this.branchesWithSameCommit().find((b) => b.name === branch.name);
    }
    getChildrenOrParents(opt) {
        return telemetry_1.tracer.spanSync({
            name: "function",
            resource: "branch.getChildrenOrParents",
            meta: { direction: opt },
        }, () => {
            const revListOutput = child_process_1.execSync(`git rev-list ${opt === "CHILDREN" ? "--children" : "--parents"} --all`, {
                maxBuffer: 1024 * 1024 * 1024,
            });
            const gitTree = gitTreeFromRevListOutput(revListOutput.toString().trim());
            const showRefOutput = child_process_1.execSync("git show-ref --heads", {
                maxBuffer: 1024 * 1024 * 1024,
            });
            const branchList = branchListFromShowRefOutput(showRefOutput.toString().trim());
            const headSha = child_process_1.execSync(`git rev-parse ${this.name}`)
                .toString()
                .trim();
            return Array.from(traverseGitTreeFromCommitUntilBranch(headSha, gitTree, branchList, 0)).map((name) => new Branch(name));
        });
    }
    setPRInfo(prInfo) {
        const meta = this.getMeta() || {};
        meta.prInfo = prInfo;
        this.writeMeta(meta);
    }
    getPRInfo() {
        var _a;
        return (_a = this.getMeta()) === null || _a === void 0 ? void 0 : _a.prInfo;
    }
    getCommitSHAs() {
        // We rely on meta here as the source of truth to handle the case where
        // the user has just created a new branch, but hasn't added any commits
        // - so both branch tips point to the same commit. Graphite knows that
        // this is a parent-child relationship, but git does not.
        const parent = this.getParentFromMeta();
        const shas = new Set();
        const commits = utils_1.gpExecSync({
            command: `git rev-list ${parent}..${this.name}`,
        }, (_) => {
            // just soft-fail if we can't find the commits
            return Buffer.alloc(0);
        })
            .toString()
            .trim();
        if (commits.length === 0) {
            return [];
        }
        commits.split(/[\r\n]+/).forEach((sha) => {
            shas.add(sha);
        });
        return [...shas];
    }
    branchesWithSameCommit() {
        const curBranchSha = child_process_1.execSync(`git show-ref --heads | grep refs/heads/${this.name} -s | awk '{print $1}'`)
            .toString()
            .trim();
        const matchingBranches = child_process_1.execSync(`git show-ref --heads | grep ${curBranchSha} | grep -v "refs/heads/${this.name}" | awk '{print $2}'`)
            .toString()
            .trim()
            .split("\n")
            .map((refName) => refName.replace("refs/heads/", ""))
            .map((name) => new Branch(name));
        return matchingBranches;
    }
    lastUpdated() {
        return new commit_1.default(this.ref()).timestampInSeconds();
    }
    lastUpdatedReadable() {
        return time_1.getReadableTimeBeforeNow(this.lastUpdated());
    }
}
exports.default = Branch;
//# sourceMappingURL=branch.js.map