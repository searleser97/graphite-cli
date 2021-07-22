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
const chalk_1 = __importDefault(require("chalk"));
const log_1 = require("../../lib/log");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const abstract_command_1 = __importDefault(require("../abstract_command"));
const args = {
    silent: {
        describe: `silence output from the command`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "s",
    },
};
class FixCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            const branch = branch_1.default.getCurrentBranch();
            if (branch === null) {
                return;
            }
            printBranchNameStack(`(Original git derived stack)`, branch.stackByTracingGitParents(), argv);
            printBranchNameStack(`(Original meta derived stack)`, branch.stackByTracingMetaParents(), argv);
            // Walk the current branch down to the base and create stacks.
            yield recursiveFix(branch, argv);
            printBranchNameStack(`(New meta stack)`, branch.stackByTracingMetaParents(), argv);
        });
    }
}
exports.default = FixCommand;
FixCommand.args = args;
function printBranchNameStack(message, names, opts) {
    log_1.log(`[${names.map((name) => `(${chalk_1.default.green(name)})`).join("->")}] ${message}`, opts);
}
function recursiveFix(branch, opts) {
    const gitChildren = branch.getChildrenFromGit();
    // Check if we're at a base branch
    gitChildren.forEach((child) => {
        const oldMetaParent = child.getParentFromMeta();
        if (!oldMetaParent || oldMetaParent.name !== branch.name) {
            log_1.log(`Updating (${child.name}) meta parent from (${oldMetaParent === null || oldMetaParent === void 0 ? void 0 : oldMetaParent.name}) to (${chalk_1.default.green(branch.name)})`, opts),
                child.setParentBranchName(branch.name);
        }
        recursiveFix(child, opts);
    });
}
//# sourceMappingURL=index.js.map