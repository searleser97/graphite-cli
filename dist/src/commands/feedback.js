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
const graphite_cli_routes_1 = __importDefault(require("@screenplaydev/graphite-cli-routes"));
const retyped_routes_1 = require("@screenplaydev/retyped-routes");
const chalk_1 = __importDefault(require("chalk"));
const api_1 = require("../lib/api");
const errors_1 = require("../lib/errors");
const telemetry_1 = require("../lib/telemetry");
const args = {
    message: {
        type: "string",
        postitional: true,
        describe: "Postive or constructive. Jokes are chill too.",
    },
};
exports.command = "feedback <message>";
exports.description = "Post a string directly to the maintainers' Slack where they can factor in your feedback, laugh at your jokes, cry at your insults, or test the bounds of Slack injection attacks.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profiledHandler(exports.command, () => __awaiter(void 0, void 0, void 0, function* () {
        const user = telemetry_1.userEmail();
        const response = yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.feedback, {
            user: user || "NotFound",
            message: argv.message || "",
            debugContext: undefined,
        });
        if (response._response.status == 200) {
            console.log(chalk_1.default.green(`Feedback received loud and clear (in a team Slack channel) :)`));
        }
        else {
            throw new errors_1.ExitFailedError(`Failed to report feedback, network response ${response.status}`);
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=feedback.js.map