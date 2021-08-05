"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scenes_1 = require("../../scenes");
const utils_1 = require("../../utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): commit create`, function () {
        utils_1.configureTest(this, scene);
        it("Can amend a commit", () => {
            scene.repo.createChange("2");
            scene.repo.execCliCommand(`commit create -m "2" -s`);
            utils_1.expectCommits(scene.repo, "2, 1");
            scene.repo.execCliCommand(`commit amend -m "3" -s`);
            utils_1.expectCommits(scene.repo, "3, 1");
            scene.repo.execCliCommand(`commit amend --no-edit -s`);
            utils_1.expectCommits(scene.repo, "3, 1");
        });
        it("Can amend if there are no staged changes", () => {
            scene.repo.execCliCommand(`commit amend -m "a" -s`);
            utils_1.expectCommits(scene.repo, "a");
        });
        it("Automatically fixes upwards", () => {
            scene.repo.createChange("2", "2");
            scene.repo.execCliCommand(`branch create a -m "2" -s`);
            scene.repo.createChange("3", "3");
            scene.repo.execCliCommand(`branch create b -m "3" -s`);
            scene.repo.checkoutBranch("a");
            scene.repo.execCliCommand(`commit amend -m "2.5" -s`);
            scene.repo.checkoutBranch("b");
            utils_1.expectCommits(scene.repo, "3, 2.5, 1");
        });
    });
}
//# sourceMappingURL=amend.test.js.map