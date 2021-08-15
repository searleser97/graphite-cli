"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutBranch = void 0;
const errors_1 = require("../errors");
const index_1 = require("./index");
function checkoutBranch(branch) {
    index_1.gpExecSync({ command: `git checkout -q "${branch}"` }, (_) => {
        throw new errors_1.ExitFailedError(`Failed to checkout branch (${branch})`);
    });
}
exports.checkoutBranch = checkoutBranch;
//# sourceMappingURL=checkout_branch.js.map