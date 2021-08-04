"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const branch_1 = __importDefault(require("../../../src/wrapper-classes/branch"));
const scenes_1 = require("../../scenes");
const utils_1 = require("../../utils");
for (const scene of [new scenes_1.TrailingProdScene()]) {
    describe(`(${scene}): stack regen`, function () {
        utils_1.configureTest(this, scene);
        it("Can regen a stack from scratch", () => {
            scene.repo.createChange("2", "2");
            scene.repo.execCliCommand(`branch create "a" -s`);
            scene.repo.createChangeAndCommit("3");
            scene.repo.createAndCheckoutBranch("b");
            scene.repo.createChangeAndCommit("4");
            const branch = new branch_1.default("b");
            chai_1.expect(branch.stackByTracingMetaParents().join(",")).not.to.equal(branch.stackByTracingGitParents().join(","));
            scene.repo.checkoutBranch("a");
            scene.repo.execCliCommand("stack regen -s");
            scene.repo.checkoutBranch("b");
            chai_1.expect(branch.stackByTracingMetaParents().join(",")).to.equal(branch.stackByTracingGitParents().join(","));
        });
        it("Can regen from trunk branch", () => {
            // Make sure to ignore prod branch
            scene.repo.execCliCommand("repo init --trunk main --ignore-branches prod");
            scene.repo.createChange("a");
            scene.repo.execCliCommand(`branch create "a" -s`);
            scene.repo.createAndCheckoutBranch("b");
            scene.repo.createChangeAndCommit("b");
            scene.repo.checkoutBranch("main");
            scene.repo.createChangeAndCommit("2");
            scene.repo.createAndCheckoutBranch("c");
            scene.repo.createChangeAndCommit("c");
            scene.repo.checkoutBranch("main");
            scene.repo.execCliCommand("stack regen");
            scene.repo.checkoutBranch("b");
            scene.repo.execCliCommand(`branch prev`);
            chai_1.expect(scene.repo.currentBranchName()).to.eq("a");
            scene.repo.execCliCommand(`branch prev`);
            chai_1.expect(scene.repo.currentBranchName()).to.eq("main");
            scene.repo.checkoutBranch("c");
            scene.repo.execCliCommand(`branch prev`);
            chai_1.expect(scene.repo.currentBranchName()).to.eq("main");
        });
        it("Can gen a stack where the branch matches main HEAD", () => {
            scene.repo.createAndCheckoutBranch("a");
            scene.repo.execCliCommand("stack regen -s");
            chai_1.expect(scene.repo.currentBranchName()).to.eq("a");
            scene.repo.execCliCommand(`branch prev`);
            chai_1.expect(scene.repo.currentBranchName()).to.eq("main");
        });
        it("Can gen a stack branch head is behind main", () => {
            scene.repo.createAndCheckoutBranch("a");
            scene.repo.checkoutBranch("main");
            scene.repo.createChangeAndCommit("2");
            scene.repo.checkoutBranch("a");
            scene.repo.execCliCommand("stack regen -s");
            scene.repo.execCliCommand(`branch prev`);
            chai_1.expect(scene.repo.currentBranchName()).to.eq("main");
        });
    });
}
//# sourceMappingURL=regen.test.js.map