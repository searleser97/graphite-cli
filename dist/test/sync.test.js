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
const chai_1 = require("chai");
const child_process_1 = require("child_process");
const tmp_1 = __importDefault(require("tmp"));
const branch_1 = __importDefault(require("../src/wrapper-classes/branch"));
const git_repo_1 = __importDefault(require("./utils/git_repo"));
const misc_1 = require("./utils/misc");
function fakeGitSquashAndMerge(repo, branchName, squashedCommitMessage) {
    // Fake github squash and merge
    child_process_1.execSync(`git -C ${repo.dir} switch -q -c temp ${branchName}`);
    repo.checkoutBranch("temp");
    child_process_1.execSync(`git -C ${repo.dir} rebase main`);
    child_process_1.execSync(`git -C ${repo.dir} reset --soft $(git -C ${repo.dir} merge-base HEAD main)`);
    repo.checkoutBranch("main");
    child_process_1.execSync(`git -C ${repo.dir} commit -m "${squashedCommitMessage}"`);
    child_process_1.execSync(`git -C ${repo.dir} branch -D temp`);
}
function sync(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        repo.checkoutBranch("main");
        const mainChildren = yield new branch_1.default("main").getChildrenFromMeta();
        do {
            const branch = mainChildren.pop();
            const children = yield branch.getChildrenFromMeta();
            if (!shouldDeleteBranch(repo, branch.name)) {
                continue;
            }
            children.forEach((child) => {
                repo.checkoutBranch(child.name);
                misc_1.execCliCommand(`fix -s`, { fromDir: repo.dir });
                misc_1.execCliCommand(`restack --onto main`, { fromDir: repo.dir });
                // child.setParentBranchName("main");
                mainChildren.push(child);
            });
            repo.checkoutBranch("main");
            deleteBranch(repo, branch.name);
            misc_1.execCliCommand(`fix -s`, { fromDir: repo.dir });
        } while (mainChildren.length > 0);
    });
}
function shouldDeleteBranch(repo, branchName) {
    console.log(`considering deleting ${branchName}, ${child_process_1.execSync(`cd ${repo.dir} && mergeBase=$(git merge-base main ${branchName}) && git cherry main $(git commit-tree $(git rev-parse "${branchName}^{tree}") -p $mergeBase -m _)`).toString()}`);
    const cherryCheckProvesMerged = child_process_1.execSync(`cd ${repo.dir} && mergeBase=$(git merge-base main ${branchName}) && git cherry main $(git commit-tree $(git rev-parse "${branchName}^{tree}") -p $mergeBase -m _)`)
        .toString()
        .trim()
        .startsWith("-");
    if (cherryCheckProvesMerged) {
        return true;
    }
    const diffCheckProvesMerged = child_process_1.execSync(`cd ${repo.dir} && git diff ${branchName} main`).toString().trim()
        .length == 0;
    if (diffCheckProvesMerged) {
        return true;
    }
    return false;
}
function deleteBranch(repo, branchName) {
    child_process_1.execSync(`git -C ${repo.dir} branch -D ${branchName}`);
}
function expectCommits(repo, commitMessages) {
    chai_1.expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(commitMessages);
}
function expectBranches(repo, sortedBranches) {
    chai_1.expect(child_process_1.execSync(`git -C ${repo.dir} for-each-ref refs/heads/ "--format=%(refname:short)"`)
        .toString()
        .trim()
        .split("\n")
        .sort()
        .join(", ")).to.equal(sortedBranches);
}
describe("Sync tests", function () {
    let tmpDir;
    let repo;
    const oldDir = __dirname;
    this.beforeEach(() => {
        tmpDir = tmp_1.default.dirSync();
        repo = new git_repo_1.default(tmpDir.name);
        process.chdir(tmpDir.name);
        repo.createChangeAndCommit("1");
    });
    afterEach(() => {
        process.chdir(oldDir);
        console.log(`Dir: ${repo.dir}`);
        // fs.emptyDirSync(tmpDir.name);
        // tmpDir.removeCallback();
    });
    this.timeout(5000);
    xit("Can delete a single merged branch", () => __awaiter(this, void 0, void 0, function* () {
        repo.createChange("2");
        misc_1.execCliCommand(`diff -b "a" -s`, { fromDir: tmpDir.name });
        expectBranches(repo, "a, main");
        fakeGitSquashAndMerge(repo, "a", "squash");
        yield sync(repo);
        expectBranches(repo, "main");
    }));
    xit("Can delete the foundation of a double stack", () => __awaiter(this, void 0, void 0, function* () {
        repo.createChange("2");
        misc_1.execCliCommand(`diff -b "a" -m "a" -s`, { fromDir: tmpDir.name });
        repo.createChange("3");
        misc_1.execCliCommand(`diff -b "b" -m "b" -s`, { fromDir: tmpDir.name });
        expectBranches(repo, "a, b, main");
        fakeGitSquashAndMerge(repo, "a", "squash");
        yield sync(repo);
        expectBranches(repo, "b, main");
        expectCommits(repo, "squash, 1");
        repo.checkoutBranch("b");
        expectCommits(repo, "b, squash, 1");
    }));
    it("Can delete two branches off a three-stack", () => __awaiter(this, void 0, void 0, function* () {
        repo.createChange("2");
        misc_1.execCliCommand(`diff -b "a" -m "a" -s`, { fromDir: tmpDir.name });
        repo.createChange("3");
        misc_1.execCliCommand(`diff -b "b" -m "b" -s`, { fromDir: tmpDir.name });
        repo.createChange("4");
        misc_1.execCliCommand(`diff -b "c" -m "c" -s`, { fromDir: tmpDir.name });
        expectBranches(repo, "a, b, c, main");
        fakeGitSquashAndMerge(repo, "a", "squash_a");
        fakeGitSquashAndMerge(repo, "b", "squash_b");
        yield sync(repo);
        expectBranches(repo, "c, main");
        expectCommits(repo, "squash_b, squash_a, 1");
    }));
});
//# sourceMappingURL=sync.test.js.map