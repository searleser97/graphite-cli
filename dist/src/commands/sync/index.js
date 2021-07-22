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
const child_process_1 = require("child_process");
const log_1 = require("../../lib/log");
const utils_1 = require("../../lib/utils");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const abstract_command_1 = __importDefault(require("../abstract_command"));
const fix_1 = __importDefault(require("../fix"));
const restack_1 = __importDefault(require("../restack"));
const args = {
    "dry-run": {
        type: "boolean",
        default: false,
        describe: "List branches that would be deleted",
    },
    silent: {
        describe: `silence output from the command`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "s",
    },
};
class SyncCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            yield sync(argv);
        });
    }
}
exports.default = SyncCommand;
SyncCommand.args = args;
function sync(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const oldBranch = branch_1.default.getCurrentBranch();
        if (oldBranch === null) {
            utils_1.logWarn("Not currently on a branch; no stack to sync.");
            return;
        }
        const oldBranchName = oldBranch.name;
        child_process_1.execSync(`git checkout -q main`);
        const mainChildren = yield new branch_1.default("main").getChildrenFromMeta();
        do {
            const branch = mainChildren.pop();
            const children = yield branch.getChildrenFromMeta();
            if (!shouldDeleteBranch(branch.name)) {
                continue;
            }
            for (const child of children) {
                child_process_1.execSync(`git checkout -q ${child.name}`);
                yield new restack_1.default().executeUnprofiled({
                    onto: "main",
                    silent: true,
                });
                mainChildren.push(child);
            }
            child_process_1.execSync(`git checkout -q main`);
            log_1.log(`Deleting ${branch.name}`, opts);
            deleteBranch(branch.name);
            yield new fix_1.default().executeUnprofiled({ silent: true });
        } while (mainChildren.length > 0);
        child_process_1.execSync(`git checkout -q ${oldBranchName}`);
    });
}
function shouldDeleteBranch(branchName) {
    const cherryCheckProvesMerged = child_process_1.execSync(`mergeBase=$(git merge-base main ${branchName}) && git cherry main $(git commit-tree $(git rev-parse "${branchName}^{tree}") -p $mergeBase -m _)`)
        .toString()
        .trim()
        .startsWith("-");
    if (cherryCheckProvesMerged) {
        return true;
    }
    const diffCheckProvesMerged = child_process_1.execSync(`git diff ${branchName} main`).toString().trim().length == 0;
    if (diffCheckProvesMerged) {
        return true;
    }
    return false;
}
function deleteBranch(branchName) {
    child_process_1.execSync(`git branch -D ${branchName}`);
}
//# sourceMappingURL=index.js.map