// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.

import { execSync } from "child_process";
import { request, telemetry } from "../shared-routes";

type TelemetryEvent = "COMMAND";

function shouldReportTelemetry(): boolean {
  return process.env.DEVELOPMENT != "true";
}

export function userEmail(): string | undefined {
  let email: string | undefined = undefined;
  try {
    email = execSync("git config user.email").toString().trim();
  } finally {
    return email;
  }
}

export async function logEvent(event: TelemetryEvent, message: string) {
  if (shouldReportTelemetry()) {
    await request.requestWithArgs(
      "https://screenplaylogs.com/v1",
      telemetry.cliEvent,
      {
        eventName: event,
        message: message,
        user: userEmail(),
      }
    );
  }
}

export async function profile<T>(handler: () => Promise<void>) {
  await handler();
}

export async function logError(err: Error) {
  if (shouldReportTelemetry()) {
    if (process.env.DEVELOPMENT != "true") {
      await request.requestWithArgs(
        "https://screenplaylogs.com/v1",
        telemetry.cli,
        {
          name: typeof err === "string" ? err : err.name || "",
          message: err.message || "",
          stack: err.stack || "",
          argv: process.argv,
          user: userEmail(),
        }
      );
    }
  }
}
