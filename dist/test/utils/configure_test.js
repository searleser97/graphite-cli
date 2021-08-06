"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTest = void 0;
function configureTest(suite, scene) {
    suite.beforeEach(() => {
        scene.setup();
    });
    suite.afterEach(() => {
        scene.cleanup();
    });
    suite.timeout(60000);
}
exports.configureTest = configureTest;
//# sourceMappingURL=configure_test.js.map