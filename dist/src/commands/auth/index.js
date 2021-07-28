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
const yargs_1 = require("yargs");
const utils_1 = require("../../lib/utils");
const abstract_command_1 = __importDefault(require("../abstract_command"));
const args = {
    token: {
        type: "string",
        alias: "t",
        describe: "The auth token for the current session",
        demandOption: true,
    },
};
class AuthCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.updateUserConfig(Object.assign(Object.assign({}, yargs_1.config), { authToken: argv.token }));
            utils_1.logSuccess("🔐 Successfully authenticated!");
        });
    }
}
exports.default = AuthCommand;
AuthCommand.args = args;
//# sourceMappingURL=index.js.map