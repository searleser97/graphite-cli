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
describe("repo-config trunk", function () {
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
    it("Can infer main trunk", () => {
        repo.createChange("2", "a");
        exec_cli_command_1.execCliCommand("branch create 'a' -m '2' -s", { fromDir: tmpDir.name });
        chai_1.expect(exec_cli_command_1.execCliCommandAndGetOutput("repo-config trunk", {
            fromDir: tmpDir.name,
        }).includes("(main)")).to.be.true;
    });
});
//# sourceMappingURL=trunk.test.js.map