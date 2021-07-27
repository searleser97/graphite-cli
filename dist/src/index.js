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
const tmp_1 = __importDefault(require("tmp"));
const yargs_1 = __importDefault(require("yargs"));
const print_stacks_1 = __importDefault(require("./commands/original-commands/print-stacks"));
// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp_1.default.setGracefulCleanup();
yargs_1.default
    .commandDir("commands")
    .command("stacks", "Prints all current stacks.", print_stacks_1.default.args, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield new print_stacks_1.default().execute(argv);
}))
    .command("diff", false, {}, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("`gp diff` has been renamed to `gp branch create`");
}))
    .command("fix", false, {}, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("`gp fix` has been renamed to `gp stack regen`");
}))
    .command("sync", false, {}, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("`gp sync` has been renamed to `gp stack clean`");
}))
    .command("submit", false, {}, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("`gp submit` has been renamed to `gp stack submit`");
}))
    .command("amend", false, { message: { type: "string", demandOption: false } }, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("`gp amend` has been renamed to `gp branch amend`");
}))
    .command("validate", false, {}, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("`gp validate` has been renamed to `gp stack validate`");
}))
    .command("prev", false, {}, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("`gp prev` has been renamed to `gp branch prev`");
}))
    .command("next", false, {}, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("`gp next` has been renamed to `gp branch next`");
}))
    .command("restack", false, { onto: { type: "string", demandOption: false } }, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("`gp restack` has been renamed to `gp stack fix`");
    console.log("`gp restack --onto` has been renamed to `gp upstack onto`");
}))
    .help()
    .usage(["This CLI helps you manage stacked diffs."].join("\n"))
    .strict()
    .demandCommand().argv;
//# sourceMappingURL=index.js.map