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
const repo_config_1 = require("../../actions/repo_config");
const telemetry_1 = require("../../lib/telemetry");
const utils_1 = require("../../lib/utils");
const args = {
    set: {
        demandOption: false,
        default: false,
        type: "string",
        alias: "s",
        describe: "Override the value of the repo owner's name in the Graphite config. This is expected to match the name of the repo owner on GitHub and should only be set in cases where Graphite is incorrectly inferring the name.",
    },
};
exports.command = "owner";
exports.description = "Graphite's conception of the current repo's owner. e.g. in 'screenplaydev/graphite-cli', this is 'screenplaydev'.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profiledHandler(exports.command, () => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.set) {
            repo_config_1.setRepoOwner(argv.set);
        }
        else {
            utils_1.logInfo(repo_config_1.getRepoOwner());
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=repo_owner.js.map