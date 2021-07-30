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
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const regen_1 = require("../../src/actions/regen");
const branch_1 = __importDefault(require("../../src/wrapper-classes/branch"));
const git_repo_1 = __importDefault(require("../utils/git_repo"));
describe("regen action", function () {
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
    it("Updates the parent branch of the base of the stack", () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const trunkBranchName = repo.currentBranchName();
        const baseBranchName = "base-stack-branch";
        repo.createAndCheckoutBranch(baseBranchName);
        repo.createChangeAndCommit("update");
        yield regen_1.regenAction(true);
        const baseBranch = yield branch_1.default.branchWithName(baseBranchName);
        chai_1.expect((_a = baseBranch.getParentFromMeta()) === null || _a === void 0 ? void 0 : _a.name).to.be.equal(trunkBranchName);
    }));
    it("Works from the middle of a stack", () => __awaiter(this, void 0, void 0, function* () {
        var _b, _c, _d;
        const trunkBranchName = repo.currentBranchName();
        // Stack: trunk -> a -> b -> c
        const branchA = "a";
        const branchB = "b";
        const branchC = "c";
        repo.createAndCheckoutBranch(`${branchA}`);
        repo.createChangeAndCommit(`${branchA}`);
        repo.createAndCheckoutBranch(`${branchB}`);
        repo.createChangeAndCommit(`${branchB}`);
        repo.createAndCheckoutBranch(`${branchC}`);
        repo.createChangeAndCommit(`${branchC}`);
        repo.checkoutBranch(branchA);
        yield regen_1.regenAction(true);
        const a = yield branch_1.default.branchWithName(branchA);
        chai_1.expect((_b = a.getParentFromMeta()) === null || _b === void 0 ? void 0 : _b.name).to.be.equal(trunkBranchName);
        const b = yield branch_1.default.branchWithName(branchB);
        chai_1.expect((_c = b.getParentFromMeta()) === null || _c === void 0 ? void 0 : _c.name).to.be.equal(branchA);
        const c = yield branch_1.default.branchWithName(branchC);
        chai_1.expect((_d = c.getParentFromMeta()) === null || _d === void 0 ? void 0 : _d.name).to.be.equal(branchB);
    }));
});
//# sourceMappingURL=regen_action.test.js.map