"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uncommittedChanges = void 0;
const _1 = require(".");
function uncommittedChanges() {
    return (_1.gpExecSync({
        command: `git status --porcelain=v1 2>/dev/null | wc -l`,
    }, () => {
        _1.logErrorAndExit(`Failed to check current dir for uncommitted changes.`);
    })
        .toString()
        .trim() !== "0");
}
exports.uncommittedChanges = uncommittedChanges;
//# sourceMappingURL=uncommitted_changes.js.map