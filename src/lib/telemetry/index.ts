// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.

import { execSync } from "child_process";

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

export async function logCommand(
  command: string,
  message?: string
): Promise<void> {
  if (shouldReportTelemetry()) {
    // TODO
  }
}

export async function profile<T>(
  command: string,
  handler: () => Promise<void>
): Promise<void> {
  void logCommand(command);
  try {
    await handler();
  } catch (err) {
    void logError(err);
    throw err;
  }
}

export async function logError(err: Error): Promise<void> {
  if (shouldReportTelemetry()) {
    // TODO
  }
}
