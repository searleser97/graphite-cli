import yargs from "yargs";
export declare function checkForUpgrade(): Promise<void>;
export declare function shouldReportTelemetry(): boolean;
export declare function userEmail(): string | undefined;
export declare function profile(args: yargs.Arguments, handler: () => Promise<void>): Promise<void>;
