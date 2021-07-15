// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.

import { execSync } from "child_process";
import { request, telemetry } from "shared-routes";

function shouldReportTelemetry(): boolean {
  return process.env.NODE_ENV != "development";
}

export function userEmail(): string | undefined {
  try {
    return execSync("git config user.email").toString().trim();
  } catch (err) {
    return undefined;
  }
}

export async function logCommand(command: string, message?: string) {
  if (shouldReportTelemetry()) {
    await request.requestWithArgs(
      "https://screenplaylogs.com/v1",
      telemetry.cliEvent,
      {
        eventName: command,
        message: message || "",
        user: userEmail(),
      }
    );
  }
}

export async function profile<T>(
  command: string,
  handler: () => Promise<void>
) {
  void logCommand(command);
  try {
    await handler();
  } catch (err) {
    void logError(err);
    throw err;
  }
}

export async function logError(err: Error) {
  if (shouldReportTelemetry()) {
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
