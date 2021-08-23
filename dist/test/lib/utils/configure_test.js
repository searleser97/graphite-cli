"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTest = void 0;
const git_refs_1 = require("../../../src/lib/git-refs");
function configureTest(suite, scene) {
    suite.timeout(600000);
    suite.beforeEach(() => {
        git_refs_1.cache.clearAll();
        scene.setup();
    });
    suite.afterEach(() => {
        scene.cleanup();
    });
}
exports.configureTest = configureTest;
//# sourceMappingURL=configure_test.js.map