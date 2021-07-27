"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const validate_1 = require("../../src/actions/validate");
const exec_cli_command_1 = require("../utils/exec_cli_command");
const git_repo_1 = __importDefault(require("../utils/git_repo"));
describe("validate action", function () {
    let tmpDir;
    let repo;
    const oldDir = __dirname;
    this.beforeEach(() => {
        tmpDir = tmp_1.default.dirSync();
        process.chdir(tmpDir.name);
        repo = new git_repo_1.default(tmpDir.name);
        repo.createChangeAndCommit("1");
    });
    this.afterEach(() => {
        process.chdir(oldDir);
        fs_extra_1.default.emptyDirSync(tmpDir.name);
        tmpDir.removeCallback();
    });
    this.timeout(5000);
    it("Can validate upstack", () => {
        repo.createChange("a");
        exec_cli_command_1.execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });
        repo.createAndCheckoutBranch("b");
        repo.createChangeAndCommit("1");
        repo.createChange("c");
        exec_cli_command_1.execCliCommand(`branch create "c" -s`, { fromDir: tmpDir.name });
        repo.createChange("d");
        exec_cli_command_1.execCliCommand(`branch create "d" -s`, { fromDir: tmpDir.name });
        repo.checkoutBranch("a");
        chai_1.expect(validate_1.validate("UPSTACK", true)).to.throw;
        repo.checkoutBranch("b");
        chai_1.expect(validate_1.validate("UPSTACK", true)).to.throw;
        repo.checkoutBranch("c");
        chai_1.expect(validate_1.validate("UPSTACK", true)).to.not.throw;
        repo.checkoutBranch("d");
        chai_1.expect(validate_1.validate("UPSTACK", true)).to.not.throw;
    });
    it("Can validate downstack", () => {
        repo.createChange("a");
        exec_cli_command_1.execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });
        repo.createAndCheckoutBranch("b");
        repo.createChangeAndCommit("1");
        repo.createChange("c");
        exec_cli_command_1.execCliCommand(`branch create "c" -s`, { fromDir: tmpDir.name });
        repo.createChange("d");
        exec_cli_command_1.execCliCommand(`branch create "d" -s`, { fromDir: tmpDir.name });
        repo.checkoutBranch("a");
        chai_1.expect(validate_1.validate("DOWNSTACK", true)).to.not.throw;
        repo.checkoutBranch("b");
        chai_1.expect(validate_1.validate("DOWNSTACK", true)).to.throw;
        repo.checkoutBranch("c");
        chai_1.expect(validate_1.validate("DOWNSTACK", true)).to.throw;
        repo.checkoutBranch("d");
        chai_1.expect(validate_1.validate("DOWNSTACK", true)).to.throw;
    });
    it("Can validate fullstack", () => {
        repo.createChange("a");
        exec_cli_command_1.execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });
        chai_1.expect(validate_1.validate("FULLSTACK", true)).to.not.throw;
        repo.createChange("b");
        exec_cli_command_1.execCliCommand(`branch create "b" -s`, { fromDir: tmpDir.name });
        chai_1.expect(validate_1.validate("FULLSTACK", true)).to.not.throw;
        repo.createAndCheckoutBranch("c");
        repo.createChangeAndCommit("c");
        chai_1.expect(validate_1.validate("FULLSTACK", true)).to.throw;
    });
});
//# sourceMappingURL=validate_action.test.js.map