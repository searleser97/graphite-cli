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
exports.profile = exports.userEmail = exports.shouldReportTelemetry = exports.checkForUpgrade = exports.profiledHandler = void 0;
// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
const graphite_cli_routes_1 = __importDefault(require("@screenplaydev/graphite-cli-routes"));
const retyped_routes_1 = require("@screenplaydev/retyped-routes");
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const node_fetch_1 = __importDefault(require("node-fetch"));
const package_json_1 = require("../../../package.json");
const init_1 = require("../../actions/init");
const api_1 = require("../api");
const config_1 = require("../config");
const errors_1 = require("../errors");
const utils_1 = require("../utils");
function profiledHandler(name, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        yield checkForUpgrade();
        yield profile(name, () => __awaiter(this, void 0, void 0, function* () {
            yield handler();
        }));
    });
}
exports.profiledHandler = profiledHandler;
function checkForUpgrade() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!shouldReportTelemetry()) {
            return;
        }
        try {
            const user = userEmail();
            const response = yield node_fetch_1.default(`https://api.graphite.dev/v1/graphite/upgrade?${[
                ...(user ? [`user=${user}`] : []),
                `currentVersion=${package_json_1.version}`,
            ].join("&")}`, { method: "GET" });
            const formatMessage = (message) => {
                return ["-".repeat(20), message, "-".repeat(20), "\n"].join("\n");
            };
            if (response.status == 200) {
                const body = yield response.json();
                const prompt = body.prompt;
                if (prompt) {
                    if (!prompt.blocking) {
                        console.log(chalk_1.default.yellow(formatMessage(prompt.message)));
                    }
                    else {
                        console.log(chalk_1.default.redBright(formatMessage(prompt.message)));
                        // eslint-disable-next-line no-restricted-syntax
                        process.exit(1);
                    }
                }
            }
        }
        catch (err) {
            return;
        }
    });
}
exports.checkForUpgrade = checkForUpgrade;
function shouldReportTelemetry() {
    return process.env.NODE_ENV != "development";
}
exports.shouldReportTelemetry = shouldReportTelemetry;
function userEmail() {
    try {
        return child_process_1.execSync("git config user.email").toString().trim();
    }
    catch (err) {
        return undefined;
    }
}
exports.userEmail = userEmail;
function logCommand(commandName, durationMiliSeconds, err) {
    return __awaiter(this, void 0, void 0, function* () {
        if (shouldReportTelemetry()) {
            yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.logCommand, {
                commandName: commandName,
                durationMiliSeconds: durationMiliSeconds,
                user: userEmail() || "NotFound",
                version: package_json_1.version,
                err: err
                    ? {
                        name: err.name,
                        message: err.message,
                        stackTrace: err.stack || "",
                        debugContext: undefined,
                    }
                    : undefined,
            });
        }
    });
}
function profile(command, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        // Self heal repo config on all commands besides init:
        if (command !== "init" && !config_1.repoConfig.getTrunk()) {
            utils_1.logInfo(`No trunk branch specified in "${config_1.repoConfig.path()}", please choose now.`);
            yield init_1.init();
        }
        const start = Date.now();
        try {
            yield handler();
        }
        catch (err) {
            const end = Date.now();
            yield logCommand(command, end - start, err);
            if (err instanceof errors_1.ExitFailedError) {
                utils_1.logError(err.message);
            }
            else if (err instanceof errors_1.PreconditionsFailedError) {
                utils_1.logInfo(err.message);
            }
            else if (err instanceof errors_1.RebaseConflictError) {
                // eslint-disable-next-line no-restricted-syntax
                process.exit(0);
            }
            else if (err instanceof errors_1.ValidationFailedError) {
                utils_1.logError(`Validation: ${err.message}`);
            }
            else if (err instanceof errors_1.ConfigError) {
                utils_1.logError(`Bad Config: ${err.message}`);
            }
            // eslint-disable-next-line no-restricted-syntax
            process.exit(1);
        }
        const end = Date.now();
        void logCommand(command, end - start);
    });
}
exports.profile = profile;
//# sourceMappingURL=index.js.map