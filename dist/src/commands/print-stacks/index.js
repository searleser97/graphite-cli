"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const abstract_command_1 = __importDefault(require("../abstract_command"));
const args = {};
function computeDag() {
    const children = {};
    const sourceBranches = [];
    branch_1.default.allBranches().forEach((branch) => {
        const branchChildren = branch.getChildrenFromGit();
        children[branch.name] = branchChildren.map((child) => child.name);
        const parents = branch.getParentsFromGit();
        if (parents.length === 0) {
            sourceBranches.push(branch.name);
        }
    });
    return {
        branchChildren: children,
        sourceBranches: sourceBranches,
    };
}
class PrintStacksCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            const gitInfo = computeDag();
            console.log(gitInfo);
            gitInfo.sourceBranches.forEach((sourceBranch) => {
                if (sourceBranch === null) {
                    return;
                }
                console.log("");
                printBranch({
                    startingBranchName: sourceBranch,
                    branchChildren: gitInfo.branchChildren,
                    visitedBranches: {},
                    indentLevel: 0,
                    startOfNewLevel: false,
                });
                console.log(`╯`);
            });
        });
    }
}
exports.default = PrintStacksCommand;
PrintStacksCommand.args = args;
function printBranch(args) {
    const childBranches = args.branchChildren[args.startingBranchName];
    if (childBranches !== undefined) {
        childBranches.forEach((childBranch, i) => {
            if (args.visitedBranches[childBranch]) {
                return;
            }
            args.visitedBranches[childBranch] = true;
            printBranch({
                startingBranchName: childBranch,
                branchChildren: args.branchChildren,
                visitedBranches: args.visitedBranches,
                indentLevel: i > 0 ? args.indentLevel + 1 : args.indentLevel,
                startOfNewLevel: args.indentLevel ? true : false,
            });
        });
    }
    if (args.indentLevel > 0) {
        console.log(`│${"  ".repeat(args.indentLevel)}* [${args.indentLevel}] ${args.startingBranchName}`);
        if (args.startOfNewLevel && args.indentLevel > 0) {
            console.log(`├${"──".repeat(args.indentLevel)}╯`);
            console.log(`│`);
        }
        else {
            console.log(`│${"  ".repeat(args.indentLevel)}│`);
        }
    }
    else {
        console.log(`* ${args.startingBranchName}`);
        console.log(`│`);
    }
}
//# sourceMappingURL=index.js.map