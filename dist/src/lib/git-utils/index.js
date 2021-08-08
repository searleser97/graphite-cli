"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workingTreeClean = void 0;
const errors_1 = require("../errors");
const utils_1 = require("../utils");
function workingTreeClean() {
    const changes = utils_1.gpExecSync({
        command: `git status --porcelain`,
    }, (_) => {
        throw new errors_1.ExitFailedError("Failed to determine changes. Aborting...");
    })
        .toString()
        .trim();
    return changes.length === 0;
}
exports.workingTreeClean = workingTreeClean;
//# sourceMappingURL=index.js.map