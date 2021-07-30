"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const branch_1 = __importDefault(require("../../src/wrapper-classes/branch"));
const exec_cli_command_1 = require("../utils/exec_cli_command");
const git_repo_1 = __importDefault(require("../utils/git_repo"));
describe("Branch tests", function () {
    let tmpDir;
    let repo;
    const oldDir = __dirname;
    this.beforeEach(() => {
        tmpDir = tmp_1.default.dirSync();
        process.chdir(tmpDir.name);
        repo = new git_repo_1.default(tmpDir.name);
        repo.createChangeAndCommit("1", "first");
    });
    afterEach(() => {
        process.chdir(oldDir);
        fs_extra_1.default.emptyDirSync(tmpDir.name);
        tmpDir.removeCallback();
    });
    it("Can list git parent for a branch", () => {
        repo.createChange("2");
        exec_cli_command_1.execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });
        const branch = new branch_1.default("a");
        chai_1.expect(branch.getParentsFromGit()[0].name).to.equal("main");
        process.chdir(oldDir);
        fs_extra_1.default.emptyDirSync(tmpDir.name);
        tmpDir.removeCallback();
    });
    it("Can list parent based on meta for a branch", () => {
        repo.createChange("2");
        exec_cli_command_1.execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });
        const branch = new branch_1.default("a");
        chai_1.expect(branch.getParentFromMeta()).is.not.undefined;
        chai_1.expect(branch.getParentFromMeta().name).to.equal("main");
        process.chdir(oldDir);
        fs_extra_1.default.emptyDirSync(tmpDir.name);
        tmpDir.removeCallback();
    });
    it("Can fetch branches that point to the same commit", () => {
        repo.createAndCheckoutBranch("a");
        repo.createChangeAndCommit("2");
        repo.createAndCheckoutBranch("b");
        repo.createAndCheckoutBranch("c");
        chai_1.expect(new branch_1.default("a")
            .branchesWithSameCommit()
            .map((b) => b.name)
            .sort()
            .join(", ")).to.eq("b, c");
    });
});
//# sourceMappingURL=branch.test.js.map