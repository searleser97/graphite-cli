import { getNumBranches, getNumCommitObjects, getUserEmail } from "./context";
import { postTelemetryInBackground } from "./post_traces";
import { profile } from "./profile";
import tracer from "./tracer";
import { fetchUpgradePromptInBackground } from "./upgrade_prompt";
declare const SHOULD_REPORT_TELEMETRY: boolean;
export { tracer, getNumBranches, getNumCommitObjects, profile, getUserEmail, SHOULD_REPORT_TELEMETRY, fetchUpgradePromptInBackground, postTelemetryInBackground, };
