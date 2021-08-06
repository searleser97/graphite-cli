"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printStack = void 0;
const chalk_1 = __importDefault(require("chalk"));
const trunk_1 = require("../lib/utils/trunk");
function printStack(branch, indentLevel, config) {
    const children = branch.getChildrenFromGit();
    const currPrefix = getPrefix(indentLevel, config);
    children.forEach((child, i) => {
        printStack(child, indentLevel + i, config);
    });
    // 1) if there is only 1 child, we only need to continue the parent's stem
    // 2) if there are multiple children, the 2..n children branch off
    //    horizontally
    const numChildren = children.length;
    if (numChildren > 1) {
        let newBranchOffshoots = "│";
        // we only need to draw numChildren - 1 offshots since the first child
        // continues the parent's main stem
        for (let i = 1; i < numChildren; i++) {
            if (i < numChildren - 1) {
                newBranchOffshoots += "──┴";
            }
            else {
                newBranchOffshoots += "──┘";
            }
        }
        console.log(currPrefix + newBranchOffshoots);
        console.log(currPrefix + "│");
    }
    // print lines of branch info
    const branchInfo = getBranchInfo(branch, config);
    branchInfo.forEach((line) => console.log(currPrefix + line));
    // print trailing stem
    // note: stem directly behind trunk should be dotted
    console.log(currPrefix +
        (!config.offTrunk && branch.name === trunk_1.getTrunk().name ? "․" : "│"));
}
exports.printStack = printStack;
function getPrefix(indentLevel, config) {
    let prefix = "";
    for (let i = 0; i < indentLevel; i++) {
        // if we're behind trunk, the stem of trunk's branch should be dotted
        if (i === 0) {
            prefix += config.offTrunk ? "│  " : "․  ";
        }
        else {
            prefix += "│  ";
        }
    }
    return prefix;
}
function getBranchInfo(branch, config) {
    var _a;
    const branchInfo = [];
    const isCurrentBranch = ((_a = config.currentBranch) === null || _a === void 0 ? void 0 : _a.name) === branch.name;
    const prInfo = branch.getPRInfo();
    const dot = isCurrentBranch ? chalk_1.default.cyan("◉") : "◯";
    const branchName = isCurrentBranch
        ? chalk_1.default.cyan(`${branch.name} (current)`)
        : chalk_1.default.blueBright(branch.name);
    const pr = prInfo !== undefined ? chalk_1.default.yellow(`PR #${prInfo.number}`) : "";
    branchInfo.push(`${dot} ${branchName} ${pr}`);
    branchInfo.push(`│ ${chalk_1.default.dim(branch.lastUpdatedReadable())}`);
    return branchInfo;
}
//# sourceMappingURL=print_stack.js.map