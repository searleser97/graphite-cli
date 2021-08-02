export declare function profiledHandler(name: string, handler: () => Promise<void>): Promise<void>;
export declare function checkForUpgrade(): Promise<void>;
export declare function shouldReportTelemetry(): boolean;
export declare function userEmail(): string | undefined;
export declare function profile(command: string, handler: () => Promise<void>): Promise<void>;
