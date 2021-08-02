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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.command = void 0;
const child_process_1 = require("child_process");
const telemetry_1 = require("../lib/telemetry");
const args = {};
exports.command = "log";
exports.description = "Log all stacks";
exports.builder = args;
const handler = () => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profiledHandler(exports.command, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            child_process_1.execSync(`git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(auto)%d%C(reset)' --all`, { stdio: "inherit" });
        }
        catch (e) {
            // Ignore errors (this just means they quit git log)
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=log.js.map