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
describe("branch create", function () {
    let tmpDir;
    let repo;
    this.beforeEach(() => {
        tmpDir = tmp_1.default.dirSync();
        repo = new git_repo_1.default(tmpDir.name);
        repo.createChangeAndCommit("1");
    });
    afterEach(() => {
        fs_extra_1.default.emptyDirSync(tmpDir.name);
        tmpDir.removeCallback();
    });
    this.timeout(5000);
    it("Can run branch create", () => {
        repo.createChange("2");
        exec_cli_command_1.execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });
        chai_1.expect(repo.currentBranchName()).to.equal("a");
        exec_cli_command_1.execCliCommand("branch prev", { fromDir: tmpDir.name });
        chai_1.expect(repo.currentBranchName()).to.equal("main");
    });
    it("Can rollback changes on a failed commit hook", () => {
        // Agressive AF commit hook from your angry coworker
        repo.createPrecommitHook("exit 1");
        repo.createChange("2");
        chai_1.expect(() => {
            exec_cli_command_1.execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });
        }).to.throw;
        chai_1.expect(repo.currentBranchName()).to.equal("main");
    });
});
//# sourceMappingURL=branch_create.test.js.map