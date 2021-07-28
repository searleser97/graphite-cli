"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const chai_1 = __importStar(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const validate_1 = require("../../src/actions/validate");
const exec_cli_command_1 = require("../utils/exec_cli_command");
const git_repo_1 = __importDefault(require("../utils/git_repo"));
chai_1.default.use(chai_as_promised_1.default);
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
    it("Can validate upstack", () => __awaiter(this, void 0, void 0, function* () {
        repo.createChange("a");
        exec_cli_command_1.execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });
        repo.createAndCheckoutBranch("b");
        repo.createChangeAndCommit("1");
        repo.createChange("c");
        exec_cli_command_1.execCliCommand(`branch create "c" -s`, { fromDir: tmpDir.name });
        repo.createChange("d");
        exec_cli_command_1.execCliCommand(`branch create "d" -s`, { fromDir: tmpDir.name });
        repo.checkoutBranch("a");
        yield chai_1.expect(validate_1.validate("UPSTACK", true)).to.eventually.be.rejectedWith(Error);
        repo.checkoutBranch("b");
        yield chai_1.expect(validate_1.validate("UPSTACK", true)).to.not.eventually.be.rejectedWith(Error);
        repo.checkoutBranch("c");
        yield chai_1.expect(validate_1.validate("UPSTACK", true)).to.not.eventually.be.rejectedWith(Error);
        repo.checkoutBranch("d");
        yield chai_1.expect(validate_1.validate("UPSTACK", true)).to.not.eventually.be.rejectedWith(Error);
    }));
    it("Can validate downstack", () => __awaiter(this, void 0, void 0, function* () {
        repo.createChange("a");
        exec_cli_command_1.execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });
        repo.createAndCheckoutBranch("b");
        repo.createChangeAndCommit("1");
        repo.createChange("c");
        exec_cli_command_1.execCliCommand(`branch create "c" -s`, { fromDir: tmpDir.name });
        repo.createChange("d");
        exec_cli_command_1.execCliCommand(`branch create "d" -s`, { fromDir: tmpDir.name });
        repo.checkoutBranch("a");
        yield chai_1.expect(validate_1.validate("DOWNSTACK", true)).to.not.eventually.be.rejectedWith(Error);
        repo.checkoutBranch("b");
        yield chai_1.expect(validate_1.validate("DOWNSTACK", true)).to.eventually.be.rejectedWith(Error);
        repo.checkoutBranch("c");
        yield chai_1.expect(validate_1.validate("DOWNSTACK", true)).to.eventually.be.rejectedWith(Error);
        repo.checkoutBranch("d");
        yield chai_1.expect(validate_1.validate("DOWNSTACK", true)).to.eventually.be.rejectedWith(Error);
    }));
    it("Can validate fullstack", () => __awaiter(this, void 0, void 0, function* () {
        repo.createChange("a");
        exec_cli_command_1.execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });
        yield chai_1.expect(validate_1.validate("FULLSTACK", true)).to.not.eventually.be.rejectedWith(Error);
        repo.createChange("b");
        exec_cli_command_1.execCliCommand(`branch create "b" -s`, { fromDir: tmpDir.name });
        yield chai_1.expect(validate_1.validate("FULLSTACK", true)).to.not.eventually.be.rejectedWith(Error);
        repo.createAndCheckoutBranch("c");
        repo.createChangeAndCommit("c");
        yield chai_1.expect(validate_1.validate("FULLSTACK", true)).to.eventually.be.rejectedWith(Error);
    }));
});
//# sourceMappingURL=validate_action.test.js.map