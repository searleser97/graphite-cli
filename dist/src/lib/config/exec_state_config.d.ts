declare type ExecStateConfigT = {
    outputDebugLogs?: boolean;
};
/**
 * An in-memory object that configures global settings for the current
 * invocation of the Graphite CLI.
 */
declare class ExecStateConfig {
    _data: ExecStateConfigT;
    constructor();
    setOutputDebugLogs(outputDebugLogs: boolean): void;
    outputDebugLogs(): boolean;
}
declare const execStateConfig: ExecStateConfig;
export default execStateConfig;
