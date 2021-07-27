/// <reference types="node" />
import { ExecSyncOptions } from "child_process";
export declare function gpExecSync(command: {
    command: string;
    options?: ExecSyncOptions;
}, onError?: (e: Error) => void): Buffer;
