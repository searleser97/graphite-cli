import { Argv } from "yargs";
export declare const command = "commit <command>";
export declare const desc = "Commands that operate on commits";
export declare const aliases: string[];
export declare const builder: (yargs: Argv) => Argv;
