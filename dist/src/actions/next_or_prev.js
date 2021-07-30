#!/usr/bin/env node
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
exports.nextOrPrevAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const utils_1 = require("../lib/utils");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
function nextOrPrevAction(nextOrPrev, silent) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = branch_1.default.getCurrentBranch();
        if (currentBranch === null) {
            utils_1.logErrorAndExit(`Not currently on branch, cannot find ${nextOrPrev}.`);
        }
        const candidates = nextOrPrev === "next"
            ? yield currentBranch.getChildrenFromGit()
            : yield currentBranch.getParentsFromGit();
        if (candidates.length === 0) {
            if (!silent) {
                console.log(chalk_1.default.yellow(`Found no ${nextOrPrev} branch`));
            }
            process.exit(1);
        }
        if (candidates.length > 1) {
            if (!silent) {
                console.log(chalk_1.default.yellow(`Found multiple possibilities:`));
                for (const candidate of candidates) {
                    console.log(chalk_1.default.yellow(` - ${candidate.name}`));
                }
            }
            process.exit(1);
        }
        const branchName = candidates.values().next().value.name;
        child_process_1.execSync(`git checkout "${branchName}"`, { stdio: "ignore" });
        utils_1.logInfo(branchName);
    });
}
exports.nextOrPrevAction = nextOrPrevAction;
//# sourceMappingURL=next_or_prev.js.map