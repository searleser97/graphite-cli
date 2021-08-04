"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNumCommitObjects = exports.getNumBranches = void 0;
const child_process_1 = require("child_process");
function getNumBranches() {
    try {
        return parseInt(child_process_1.execSync("git branch | wc -l").toString().trim());
    }
    catch (_a) {
        return undefined;
    }
}
exports.getNumBranches = getNumBranches;
function getNumCommitObjects() {
    try {
        return parseInt(child_process_1.execSync("git rev-list --all | wc -l").toString().trim());
    }
    catch (_a) {
        return undefined;
    }
}
exports.getNumCommitObjects = getNumCommitObjects;
//# sourceMappingURL=context.js.map