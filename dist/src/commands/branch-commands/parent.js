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
exports.handler = exports.builder = exports.description = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const log_1 = require("../../lib/log");
const preconditions_1 = require("../../lib/preconditions");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    set: {
        type: "string",
        describe: "Manually set the stack parent of the current branch. This operation only modifies Graphite metadata and does not rebase any branches.",
        required: false,
    },
    silent: {
        describe: `silence output from the command`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "s",
    },
};
exports.command = "parent";
exports.description = "Show the parent of your current branch, as recorded in Graphite's stacks. Parent information is stored under `.git/refs/branch-metadata`.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, () => __awaiter(void 0, void 0, void 0, function* () {
        const branch = preconditions_1.currentBranchPrecondition();
        if (argv.set) {
            setParent(branch, argv.set, argv.silent);
        }
        else {
            const parent = branch.getParentFromMeta();
            if (parent) {
                console.log(parent.name);
            }
            else {
                log_1.log(`Current branch (${branch}) has no Graphite parent set. Consider running \`gp branch parent --set <parent>\`, \`gp stack regen\`, or \`gp upstack onto <parent>\` to set a Graphite parent branch.`, argv);
            }
        }
    }));
});
exports.handler = handler;
function setParent(branch, parent, silent) {
    preconditions_1.branchExistsPrecondition(parent);
    const oldParent = branch.getParentFromMeta();
    branch.setParentBranchName(parent);
    log_1.log(`Updated (${branch}) parent from (${oldParent}) to (${chalk_1.default.green(parent)})`, { silent });
    return;
}
//# sourceMappingURL=parent.js.map