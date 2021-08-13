"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../scenes");
const utils_1 = require("../utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): stacks`, function () {
        utils_1.configureTest(this, scene);
        it("Can print stacks", () => {
            chai_1.expect(() => scene.repo.execCliCommand(`stacks`)).to.not.throw(Error);
        });
    });
}
//# sourceMappingURL=stacks.test.js.map