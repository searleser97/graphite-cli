"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../scenes");
const utils_1 = require("../../utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): repo trunk`, function () {
        utils_1.configureTest(this, scene);
        it("Can infer main trunk", () => {
            scene.repo.createChange("2", "a");
            scene.repo.execCliCommand("branch create 'a' -m '2' -q");
            chai_1.expect(scene.repo.execCliCommandAndGetOutput("repo trunk").includes("(main)")).to.be.true;
        });
    });
}
//# sourceMappingURL=trunk.test.js.map