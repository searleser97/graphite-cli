"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uncommittedChanges = void 0;
const _1 = require(".");
const errors_1 = require("../errors");
function uncommittedChanges() {
    return (_1.gpExecSync({
        command: `git status --porcelain=v1 2>/dev/null | wc -l`,
    }, (err) => {
        throw new errors_1.ExitFailedError(`Failed to check current dir for uncommitted changes.`, err);
    })
        .toString()
        .trim() !== "0");
}
exports.uncommittedChanges = uncommittedChanges;
//# sourceMappingURL=uncommitted_changes.js.map