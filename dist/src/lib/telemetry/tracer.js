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
exports.Span = void 0;
// https://docs.datadoghq.com/api/latest/tracing/
const graphite_cli_routes_1 = __importDefault(require("@screenplaydev/graphite-cli-routes"));
const retyped_routes_1 = require("@screenplaydev/retyped-routes");
const package_json_1 = require("../../../package.json");
const api_1 = require("../api");
const utils_1 = require("../utils");
const traceId = generateId();
function generateId() {
    return Math.ceil(Math.random() * 1000000000);
}
function notUndefined(value) {
    return value !== null && value !== undefined;
}
function currentNanoSeconds() {
    const hrTime = process.hrtime();
    return hrTime[0] * 1000000000 + hrTime[1];
}
class Span {
    constructor(opts) {
        this.name = opts.name || utils_1.makeId(10);
        this.parentId = opts.parentId;
        this.resource = opts.resource;
        this.meta = opts.meta;
        this.spanId = generateId();
        this.start = currentNanoSeconds();
    }
    end(err) {
        this.endedSpan = Object.assign({ error: err ? 1 : 0, meta: err
                ? Object.assign(Object.assign({ "error.msg": err.message, "error.type": err.constructor.name }, (err.stack ? { "error.stack": err.stack } : {})), this.meta) : this.meta, metrics: {}, name: this.name, resource: this.resource, service: "graphite-cli", span_id: this.spanId, start: Math.round(this.start), trace_id: traceId, type: "custom", duration: Math.round(currentNanoSeconds() - this.start) }, (this.parentId ? { parent_id: this.parentId } : {}));
    }
}
exports.Span = Span;
class Tracer {
    constructor() {
        this.allSpans = [];
    }
    startSpan(opts) {
        const span = new Span(Object.assign(Object.assign({}, opts), (this.currentSpanId ? { parentId: this.currentSpanId } : {})));
        this.allSpans.push(span);
        return span;
    }
    spanSync(opts, handler) {
        const span = this.startSpan(opts);
        this.currentSpanId = span.spanId;
        try {
            handler();
        }
        catch (err) {
            span.end(err);
            throw err;
        }
        span.end();
        this.currentSpanId = span.parentId;
    }
    span(opts, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            const span = this.startSpan(opts);
            this.currentSpanId = span.spanId;
            try {
                yield handler();
            }
            catch (err) {
                span.end(err);
                throw err;
            }
            span.end();
            this.currentSpanId = span.parentId;
        });
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            const trace = this.allSpans
                .map((s) => s.endedSpan)
                .filter(notUndefined);
            const traces = [trace];
            this.allSpans = this.allSpans.filter((s) => !s.endedSpan);
            if (process.env.NODE_ENV !== "development") {
                yield retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1.default.traces, {
                    cliVersion: package_json_1.version,
                    jsonTraces: JSON.stringify(traces),
                });
            }
        });
    }
}
const globalTracer = new Tracer();
exports.default = globalTracer;
//# sourceMappingURL=tracer.js.map