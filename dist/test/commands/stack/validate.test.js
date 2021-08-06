"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../scenes");
const utils_1 = require("../../utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): stack validate`, function () {
        utils_1.configureTest(this, scene);
        it("Can pass validation", () => {
            scene.repo.createChange("2");
            scene.repo.execCliCommand(`branch create "a" -m "a" -s`);
            scene.repo.createChange("3");
            scene.repo.execCliCommand(`branch create "b" -m "b" -s`);
            // Expect this command not to fail.
            scene.repo.execCliCommand("stack validate -s");
        });
        it("Can fail validation", () => {
            scene.repo.createAndCheckoutBranch("a");
            scene.repo.createChangeAndCommit("2");
            scene.repo.createAndCheckoutBranch("b");
            scene.repo.createChangeAndCommit("3");
            // Expect this command to fail for having no meta.
            chai_1.expect(() => {
                scene.repo.execCliCommand("stack validate -s");
            }).to.throw(Error);
        });
        it("Can pass validation if child branch points to same commit as parent", () => {
            scene.repo.createAndCheckoutBranch("a");
            scene.repo.execCliCommand("upstack onto main");
            chai_1.expect(() => {
                scene.repo.execCliCommand("stack validate -s");
            }).to.not.throw(Error);
            scene.repo.checkoutBranch("main");
            chai_1.expect(() => {
                scene.repo.execCliCommand("stack validate -s");
            }).to.not.throw(Error);
        });
    });
}
//# sourceMappingURL=validate.test.js.map