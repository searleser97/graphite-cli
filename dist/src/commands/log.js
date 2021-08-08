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
exports.handler = exports.aliases = exports.builder = exports.description = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const print_stack_1 = require("../actions/print_stack");
const telemetry_1 = require("../lib/telemetry");
const trunk_1 = require("../lib/utils/trunk");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
const args = {
    commits: {
        describe: `Show commits in the log output`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "c",
    },
};
exports.command = "log";
exports.description = "Log all stacks";
exports.builder = args;
exports.aliases = ["l"];
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, () => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.commits) {
            // If this flag is passed, print the old logging style:
            try {
                child_process_1.execSync(`git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(auto)%d%C(reset)' --all`, { stdio: "inherit" });
            }
            catch (e) {
                // Ignore errors (this just means they quit git log)
            }
        }
        else {
            // Use our custom logging of branches and stacks:
            try {
                printTrunkLog();
                yield printStacksBehindTrunk();
            }
            catch (e) {
                console.log(e);
            }
        }
    }));
});
exports.handler = handler;
function printTrunkLog() {
    const trunk = trunk_1.getTrunk();
    print_stack_1.printStack(trunk, 0, {
        currentBranch: branch_1.default.getCurrentBranch(),
        offTrunk: true,
    });
}
function printStacksBehindTrunk() {
    return __awaiter(this, void 0, void 0, function* () {
        const trunk = trunk_1.getTrunk();
        const branchesWithoutParents = (yield branch_1.default.getAllBranchesWithoutParents()).filter((branch) => branch.name !== trunk.name);
        if (branchesWithoutParents.length === 0) {
            return;
        }
        console.log("․");
        console.log("․");
        console.log(`․  ${chalk_1.default.bold(`Stack(s) below trail ${trunk.name}.`)}`);
        console.log(`․  To fix a stack, check out the stack and run \`gp stack fix\`.`);
        console.log("․");
        branchesWithoutParents.forEach((branch) => {
            console.log("․");
            print_stack_1.printStack(branch, 1, {
                currentBranch: branch_1.default.getCurrentBranch(),
                offTrunk: false,
            });
            console.log(`◌──┘`);
            console.log("․");
        });
    });
}
//# sourceMappingURL=log.js.map