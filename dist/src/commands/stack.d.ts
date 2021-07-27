import yargs from "yargs";
export declare const command = "stack <command>";
export declare const desc = "Stack commands";
export declare const aliases: string[];
export declare const builder: (yargs: yargs.Argv<{}>) => yargs.Argv<{}>;
