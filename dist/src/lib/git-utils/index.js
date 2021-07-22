"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workingTreeClean = void 0;
const utils_1 = require("../utils");
function workingTreeClean() {
    const changes = utils_1.gpExecSync({
        command: `git status --porcelain`,
    }, (_) => {
        utils_1.logInternalErrorAndExit("Failed to determine changes. Aborting...");
    })
        .toString()
        .trim();
    return changes.length === 0;
}
exports.workingTreeClean = workingTreeClean;
//# sourceMappingURL=index.js.map