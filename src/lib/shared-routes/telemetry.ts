import * as t from "../retype";
import { asRouteTree } from "./base";

/**
 * These are just intended for "sad-path" logging (i.e. places where
 * something has gone wrong). If you are trying to log metrics on things
 * which went well, please just hit our monolith directly.
 */

const API_ROUTES = asRouteTree({
  oldIntercut: {
    method: "POST",
    url: "/intercut/:releaseSecret/telemetry",
    urlParams: {
      releaseSecret: t.string,
    },
    params: {
      kind: t.literal("ERROR" as const),
      errorKind: t.string,
    },
  },
  intercut: {
    method: "POST",
    url: "/intercut/telemetry",
    headers: {
      "X-SP-APP-SECRET": t.string,
    },
    params: {
      kind: t.literal("ERROR" as const),
      errorKind: t.string,
    },
  },
  buildPhase: {
    method: "POST",
    url: "/error-logging/build-phase",
    params: {
      errors: t.array(
        t.shape({
          name: t.string,
          message: t.string,
          stack: t.optional(t.string),
        })
      ),
      argv: t.array(t.string),
      appSecret: t.optional(t.string),
    },
  },
  cli: {
    method: "POST",
    url: "/error-logging/cli",
    params: {
      name: t.string,
      message: t.string,
      stack: t.string,
      argv: t.array(t.string),
      user: t.optional(t.string),
    },
  },
  cliEvent: {
    method: "POST",
    url: "/event/cli",
    params: {
      eventName: t.string,
      message: t.string,
      user: t.optional(t.string),
    },
  },
} as const);

export default API_ROUTES;
