"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unstagedChanges = exports.uncommittedChanges = void 0;
const _1 = require(".");
const errors_1 = require("../errors");
var ChangeType;
(function (ChangeType) {
    ChangeType[ChangeType["uncommitted"] = 0] = "uncommitted";
    ChangeType[ChangeType["unstaged"] = 1] = "unstaged";
})(ChangeType || (ChangeType = {}));
function gitStatus(changeType) {
    const cmd = `git status ${changeType == ChangeType.unstaged ? '-u' : ''} --porcelain=v1 2>/dev/null | wc -l`;
    return (_1.gpExecSync({
        command: cmd,
    }, () => {
        throw new errors_1.ExitFailedError(`Failed to check current dir for uncommitted changes.`);
    })
        .toString()
        .trim() !== "0");
}
function uncommittedChanges() {
    return gitStatus(ChangeType.uncommitted);
}
exports.uncommittedChanges = uncommittedChanges;
function unstagedChanges() {
    return gitStatus(ChangeType.unstaged);
}
exports.unstagedChanges = unstagedChanges;
//# sourceMappingURL=git_status_utils.js.map