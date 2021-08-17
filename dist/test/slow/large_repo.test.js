"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scenes_1 = require("../lib/scenes");
const utils_1 = require("../lib/utils");
for (const scene of [new scenes_1.BasicScene(), new scenes_1.LargeScene()]) {
    describe(`(${scene}): Run simple timed commands`, function () {
        utils_1.configureTest(this, scene);
        it("Can run stacks quickly", () => {
            scene.repo.execCliCommand(`log short`);
        }).timeout(10000);
        it("Can run log quickly", () => {
            scene.repo.execCliCommand(`log`);
        }).timeout(10000);
    });
}
//# sourceMappingURL=large_repo.test.js.map