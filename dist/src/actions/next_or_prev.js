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
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
function nextOrPrevAction(nextOrPrev, silent) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = preconditions_1.currentBranchPrecondition();
        const candidates = nextOrPrev === "next"
            ? yield currentBranch.getChildrenFromMeta()
            : currentBranch.getParentFromMeta();
        let branch;
        if (candidates instanceof Array) {
            if (candidates.length === 0) {
                throw new errors_1.ExitFailedError(`Found no ${nextOrPrev} branch`);
            }
            if (candidates.length > 1) {
                throw new errors_1.PreconditionsFailedError([
                    chalk_1.default.yellow(`Found multiple possibilities:`),
                    ...candidates.map((candidate) => chalk_1.default.yellow(` - ${candidate.name}`)),
                ].join("\n"));
            }
            branch = candidates[0];
        }
        else if (!candidates) {
            throw new errors_1.ExitFailedError(`Found no ${nextOrPrev} branch`);
        }
        else {
            branch = candidates;
        }
        const branchName = branch;
        child_process_1.execSync(`git checkout "${branchName.name}"`, { stdio: "ignore" });
        utils_1.logInfo(branchName.name);
    });
}
exports.nextOrPrevAction = nextOrPrevAction;
//# sourceMappingURL=next_or_prev.js.map