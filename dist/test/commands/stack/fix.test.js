"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const exec_cli_command_1 = require("../../utils/exec_cli_command");
const git_repo_1 = __importDefault(require("../../utils/git_repo"));
describe("stack fix", function () {
    let tmpDir;
    let repo;
    this.beforeEach(() => {
        tmpDir = tmp_1.default.dirSync();
        repo = new git_repo_1.default(tmpDir.name);
        repo.createChangeAndCommit("1", "first");
    });
    afterEach(() => {
        fs_extra_1.default.emptyDirSync(tmpDir.name);
        tmpDir.removeCallback();
    });
    this.timeout(5000);
    it("Can fix a stack of three branches", () => {
        repo.createChange("2", "a");
        exec_cli_command_1.execCliCommand("branch create 'a' -m '2' -s", { fromDir: tmpDir.name });
        repo.createChangeAndCommit("2.5", "a.5");
        repo.createChange("3", "b");
        exec_cli_command_1.execCliCommand("branch create 'b' -m '3' -s", { fromDir: tmpDir.name });
        repo.createChangeAndCommit("3.5", "b.5");
        repo.createChange("4", "c");
        exec_cli_command_1.execCliCommand("branch create 'c' -m '4' -s", { fromDir: tmpDir.name });
        chai_1.expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("4, 3.5, 3, 2.5, 2, 1");
        repo.checkoutBranch("main");
        repo.createChangeAndCommit("1.5", "main");
        chai_1.expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("1.5, 1");
        exec_cli_command_1.execCliCommand("stack fix -s", { fromDir: tmpDir.name });
        chai_1.expect(repo.currentBranchName()).to.equal("main");
        repo.checkoutBranch("c");
        chai_1.expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("4, 3.5, 3, 2.5, 2, 1.5, 1");
    });
    it("Can handle merge conflicts, leveraging prevRef metadata", () => {
        repo.createChange("2");
        exec_cli_command_1.execCliCommand("branch create 'a' -m '2' -s", { fromDir: tmpDir.name });
        repo.createChange("3");
        exec_cli_command_1.execCliCommand("branch create 'b' -m '3' -s", { fromDir: tmpDir.name });
        repo.checkoutBranch("main");
        repo.createChangeAndCommit("1.5");
        try {
            exec_cli_command_1.execCliCommand("stack fix -s", { fromDir: repo.dir });
        }
        catch (_a) {
            repo.finishInteractiveRebase();
        }
        chai_1.expect(repo.rebaseInProgress()).to.eq(false);
        chai_1.expect(repo.currentBranchName()).to.eq("a");
        try {
            exec_cli_command_1.execCliCommand("stack fix -s", { fromDir: repo.dir });
        }
        catch (_b) {
            repo.finishInteractiveRebase();
        }
        chai_1.expect(repo.currentBranchName()).to.eq("b");
        chai_1.expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("3, 2, 1.5, 1");
    });
});
//# sourceMappingURL=fix.test.js.map