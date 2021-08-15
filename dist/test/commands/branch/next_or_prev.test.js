"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../scenes");
const utils_1 = require("../../utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): next and prev`, function () {
        utils_1.configureTest(this, scene);
        it("Can move to the next and prev branch", () => {
            scene.repo.createChange("a", "a");
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.checkoutBranch("main");
            scene.repo.execCliCommand(`branch next --no-interactive`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal("a");
            scene.repo.execCliCommand(`branch prev --no-interactive`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal("main");
            scene.repo.execCliCommand(`branch prev --no-interactive`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal("main");
        });
    });
}
//# sourceMappingURL=next_or_prev.test.js.map