"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../scenes");
const utils_1 = require("../../utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): branch create`, function () {
        utils_1.configureTest(this, scene);
        it("Can run branch create", () => {
            scene.repo.execCliCommand(`branch create "a" -q`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal("a");
            scene.repo.execCliCommand("branch prev --no-interactive");
            chai_1.expect(scene.repo.currentBranchName()).to.equal("main");
        });
        it("Can rollback changes on a failed commit hook", () => {
            // Agressive AF commit hook from your angry coworker
            scene.repo.createPrecommitHook("exit 1");
            scene.repo.createChange("2");
            chai_1.expect(() => {
                scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            }).to.throw(Error);
            chai_1.expect(scene.repo.currentBranchName()).to.equal("main");
        });
        it("Can create a branch without providing a name", () => {
            scene.repo.createChange("2");
            scene.repo.execCliCommand(`branch create -m "feat(test): info" -q`);
            chai_1.expect(scene.repo.currentBranchName().includes("feat_test_info")).to.be
                .true;
        });
    });
}
//# sourceMappingURL=branch_create.test.js.map