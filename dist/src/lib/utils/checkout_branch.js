"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutBranch = void 0;
const index_1 = require("./index");
function checkoutBranch(branch) {
    index_1.gpExecSync({ command: `git checkout -q "${branch}"` }, (_) => {
        index_1.logInternalErrorAndExit(`Failed to checkout branch (${branch})`);
    });
}
exports.checkoutBranch = checkoutBranch;
//# sourceMappingURL=checkout_branch.js.map