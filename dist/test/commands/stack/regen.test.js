"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const branch_1 = __importDefault(require("../../../src/wrapper-classes/branch"));
const scenes_1 = require("../../scenes");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): stack regen`, function () {
        this.beforeEach(() => {
            scene.setup();
        });
        this.afterEach(() => {
            scene.cleanup();
        });
        this.timeout(5000);
        it("Can fix a stack", () => {
            scene.repo.createChange("2", "2");
            scene.repo.execCliCommand(`branch create "a" -s`);
            scene.repo.createChangeAndCommit("3");
            scene.repo.createAndCheckoutBranch("b");
            scene.repo.createChangeAndCommit("4");
            const branch = new branch_1.default("b");
            chai_1.expect(branch.stackByTracingMetaParents().join(",")).not.to.equal(branch.stackByTracingGitParents().join(","));
            scene.repo.checkoutBranch("main");
            scene.repo.execCliCommand("stack regen -s");
            scene.repo.checkoutBranch("b");
            chai_1.expect(branch.stackByTracingMetaParents().join(",")).to.equal(branch.stackByTracingGitParents().join(","));
        });
    });
}
//# sourceMappingURL=regen.test.js.map