declare type spanT = {
    duration: number;
    error: number;
    meta?: Record<string, string>;
    metrics: Record<string, number>;
    name: string;
    parent_id?: number;
    resource: string;
    service: "graphite-cli";
    span_id: number;
    start: number;
    trace_id: number;
    type: "custom";
};
export declare class Span {
    name: string;
    parentId?: number;
    resource: string;
    spanId: number;
    start: number;
    meta?: Record<string, string>;
    endedSpan: spanT | undefined;
    constructor(opts: {
        resource: string;
        name?: string;
        parentId?: number;
        meta?: Record<string, string>;
    });
    end(err?: Error): void;
}
declare class Tracer {
    currentSpanId: number | undefined;
    allSpans: Span[];
    startSpan(opts: {
        resource: string;
        name?: string;
        meta?: Record<string, string>;
    }): Span;
    spanSync(opts: {
        resource: string;
        name?: string;
        meta?: Record<string, string>;
    }, handler: () => void): void;
    span(opts: {
        resource: string;
        name?: string;
        meta?: Record<string, string>;
    }, handler: () => Promise<void>): Promise<void>;
    flush(): Promise<void>;
}
declare const globalTracer: Tracer;
export default globalTracer;
