"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../scenes");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): stack fix`, function () {
        this.beforeEach(() => {
            scene.setup();
        });
        this.afterEach(() => {
            scene.cleanup();
        });
        this.timeout(5000);
        it("Can fix a stack of three branches", () => {
            scene.repo.createChange("2", "a");
            scene.repo.execCliCommand("branch create 'a' -m '2' -s");
            scene.repo.createChangeAndCommit("2.5", "a.5");
            scene.repo.createChange("3", "b");
            scene.repo.execCliCommand("branch create 'b' -m '3' -s");
            scene.repo.createChangeAndCommit("3.5", "b.5");
            scene.repo.createChange("4", "c");
            scene.repo.execCliCommand("branch create 'c' -m '4' -s");
            chai_1.expect(scene.repo.listCurrentBranchCommitMessages().slice(0, 6).join(", ")).to.equal("4, 3.5, 3, 2.5, 2, 1");
            scene.repo.checkoutBranch("main");
            scene.repo.createChangeAndCommit("1.5", "main");
            chai_1.expect(scene.repo.listCurrentBranchCommitMessages().slice(0, 2).join(", ")).to.equal("1.5, 1");
            scene.repo.execCliCommand("stack fix -s");
            chai_1.expect(scene.repo.currentBranchName()).to.equal("main");
            scene.repo.checkoutBranch("c");
            chai_1.expect(scene.repo.listCurrentBranchCommitMessages().slice(0, 7).join(", ")).to.equal("4, 3.5, 3, 2.5, 2, 1.5, 1");
        });
        it("Can handle merge conflicts, leveraging prevRef metadata", () => {
            scene.repo.createChange("2");
            scene.repo.execCliCommand("branch create 'a' -m '2' -s");
            scene.repo.createChange("3");
            scene.repo.execCliCommand("branch create 'b' -m '3' -s");
            scene.repo.checkoutBranch("main");
            scene.repo.createChangeAndCommit("1.5");
            scene.repo.execCliCommand("stack fix -s");
            scene.repo.finishInteractiveRebase();
            chai_1.expect(scene.repo.rebaseInProgress()).to.eq(false);
            chai_1.expect(scene.repo.currentBranchName()).to.eq("a");
            scene.repo.execCliCommand("stack fix -s");
            scene.repo.finishInteractiveRebase();
            chai_1.expect(scene.repo.currentBranchName()).to.eq("b");
            chai_1.expect(scene.repo.listCurrentBranchCommitMessages().slice(0, 4).join(", ")).to.equal("3, 2, 1.5, 1");
        });
    });
}
//# sourceMappingURL=fix.test.js.map