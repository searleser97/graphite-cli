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
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const exec_cli_command_1 = require("../utils/exec_cli_command");
const git_repo_1 = __importDefault(require("../utils/git_repo"));
function fakeGitSquashAndMerge(repo, branchName, squashedCommitMessage) {
    // Fake github squash and merge
    child_process_1.execSync(`git -C ${repo.dir} switch -q -c temp ${branchName}`);
    repo.checkoutBranch("temp");
    child_process_1.execSync(`git -C ${repo.dir} rebase main -Xtheirs`);
    child_process_1.execSync(`git -C ${repo.dir} reset --soft $(git -C ${repo.dir} merge-base HEAD main)`);
    repo.checkoutBranch("main");
    child_process_1.execSync(`git -C ${repo.dir} commit -m "${squashedCommitMessage}"`);
    child_process_1.execSync(`git -C ${repo.dir} branch -D temp`);
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
// eslint-disable-next-line max-lines-per-function
describe("Sync tests", function () {
    let tmpDir;
    let repo;
    const oldDir = __dirname;
    this.beforeEach(() => {
        tmpDir = tmp_1.default.dirSync();
        repo = new git_repo_1.default(tmpDir.name);
        process.chdir(tmpDir.name);
        repo.createChangeAndCommit("1", "first");
    });
    afterEach(() => {
        process.chdir(oldDir);
        console.log(`Dir: ${repo.dir}`);
        fs_extra_1.default.emptyDirSync(tmpDir.name);
        tmpDir.removeCallback();
    });
    this.timeout(10000);
    it("Can delete a single merged branch", () => __awaiter(this, void 0, void 0, function* () {
        repo.createChange("2", "a");
        exec_cli_command_1.execCliCommand(`diff -b "a" -s`, { fromDir: tmpDir.name });
        expectBranches(repo, "a, main");
        fakeGitSquashAndMerge(repo, "a", "squash");
        exec_cli_command_1.execCliCommand(`sync -sf --trunk main`, { fromDir: tmpDir.name });
        expectBranches(repo, "main");
    }));
    it("Can delete the foundation of a double stack", () => __awaiter(this, void 0, void 0, function* () {
        repo.createChange("2", "a");
        exec_cli_command_1.execCliCommand(`diff -b "a" -m "a" -s`, { fromDir: tmpDir.name });
        repo.createChange("3", "b");
        exec_cli_command_1.execCliCommand(`diff -b "b" -m "b" -s`, { fromDir: tmpDir.name });
        expectBranches(repo, "a, b, main");
        fakeGitSquashAndMerge(repo, "a", "squash");
        exec_cli_command_1.execCliCommand(`sync -sf --trunk main`, { fromDir: tmpDir.name });
        expectBranches(repo, "b, main");
        expectCommits(repo, "squash, 1");
        repo.checkoutBranch("b");
        expectCommits(repo, "b, squash, 1");
    }));
    it("Can delete two branches off a three-stack", () => __awaiter(this, void 0, void 0, function* () {
        repo.createChange("2", "a");
        exec_cli_command_1.execCliCommand(`diff -b "a" -m "a" -s`, { fromDir: tmpDir.name });
        repo.createChange("3", "b");
        exec_cli_command_1.execCliCommand(`diff -b "b" -m "b" -s`, { fromDir: tmpDir.name });
        repo.createChange("4", "c");
        exec_cli_command_1.execCliCommand(`diff -b "c" -m "c" -s`, { fromDir: tmpDir.name });
        expectBranches(repo, "a, b, c, main");
        fakeGitSquashAndMerge(repo, "a", "squash_a");
        fakeGitSquashAndMerge(repo, "b", "squash_b");
        exec_cli_command_1.execCliCommand(`sync -sf --trunk main`, { fromDir: tmpDir.name });
        expectBranches(repo, "c, main");
        expectCommits(repo, "squash_b, squash_a, 1");
    }));
    it("Can delete two branches, while syncing inbetween, off a three-stack", () => __awaiter(this, void 0, void 0, function* () {
        repo.createChange("2", "a");
        exec_cli_command_1.execCliCommand(`diff -b "a" -m "a" -s`, { fromDir: tmpDir.name });
        repo.createChange("3", "b");
        exec_cli_command_1.execCliCommand(`diff -b "b" -m "b" -s`, { fromDir: tmpDir.name });
        repo.createChange("4", "c");
        exec_cli_command_1.execCliCommand(`diff -b "c" -m "c" -s`, { fromDir: tmpDir.name });
        expectBranches(repo, "a, b, c, main");
        fakeGitSquashAndMerge(repo, "a", "squash_a");
        exec_cli_command_1.execCliCommand(`sync -sf --trunk main`, { fromDir: tmpDir.name });
        fakeGitSquashAndMerge(repo, "b", "squash_b");
        exec_cli_command_1.execCliCommand(`sync -sf --trunk main`, { fromDir: tmpDir.name });
        expectBranches(repo, "c, main");
        expectCommits(repo, "squash_b, squash_a, 1");
    }));
    xit("Can detect dead branches off multiple stacks", () => __awaiter(this, void 0, void 0, function* () {
        repo.createChange("2", "a");
        exec_cli_command_1.execCliCommand(`diff -b "a" -m "a" -s`, { fromDir: tmpDir.name });
        repo.createChange("3", "b");
        exec_cli_command_1.execCliCommand(`diff -b "b" -m "b" -s`, { fromDir: tmpDir.name });
        repo.createChange("4", "c");
        exec_cli_command_1.execCliCommand(`diff -b "c" -m "c" -s`, { fromDir: tmpDir.name });
        expectBranches(repo, "a, b, c, main");
        repo.checkoutBranch("main");
        repo.createChange("5", "d");
        exec_cli_command_1.execCliCommand(`diff -b "d" -m "d" -s`, { fromDir: tmpDir.name });
        repo.createChange("6", "e");
        exec_cli_command_1.execCliCommand(`diff -b "e" -m "e" -s`, { fromDir: tmpDir.name });
        fakeGitSquashAndMerge(repo, "a", "squash_a");
        fakeGitSquashAndMerge(repo, "b", "squash_b");
        fakeGitSquashAndMerge(repo, "d", "squash_d");
        exec_cli_command_1.execCliCommand(`sync -sf --trunk main`, { fromDir: tmpDir.name });
        expectBranches(repo, "c, e, main");
        repo.checkoutBranch("main");
        expectCommits(repo, "squash_b, squash_a, 1");
        repo.checkoutBranch("c");
        expectCommits(repo, "c, squash_d, squash_b, squash_a, 1");
        repo.checkoutBranch("e");
        expectCommits(repo, "e, squash_d, squash_b, squash_a, 1");
    }));
});
//# sourceMappingURL=sync.test.js.map