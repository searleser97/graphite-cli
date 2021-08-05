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
const config_1 = require("../lib/config");
const telemetry_1 = require("../lib/telemetry");
const utils_1 = require("../lib/utils");
const args = {
    token: {
        type: "string",
        alias: "t",
        describe: "Auth token",
        demandOption: true,
    },
};
exports.command = "auth";
exports.description = "Associates an auth token with your Graphite CLI. This token is used to associate your CLI with your account, allowing us to create and update your PRs on GitHub, for example. To obtain your CLI token, visit https://app.graphite.dev/activate.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, () => __awaiter(void 0, void 0, void 0, function* () {
        config_1.userConfig.setAuthToken(argv.token);
        utils_1.logSuccess("🔐 Successfully authenticated!");
    }));
});
exports.handler = handler;
//# sourceMappingURL=auth.js.map