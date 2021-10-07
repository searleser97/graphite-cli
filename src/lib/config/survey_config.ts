import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import { request } from "@screenplaydev/retyped-routes";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { API_SERVER } from "../api";
import { cliAuthPrecondition } from "../preconditions";
import { SurveyResponseT } from "../telemetry/survey/survey";

const SURVEY_CONFIG_NAME = ".graphite_beta_survey";
const SURVEY_CONFIG_PATH = path.join(os.homedir(), SURVEY_CONFIG_NAME);

const MS_IN_DAY = 60 * 60 * 24 * 1000;
const MS_IN_WEEK = 7 * MS_IN_DAY;
export const MS_BETWEEN_SURVEYS = 2 * MS_IN_WEEK;

type TSurveyConfig = {
  responses?: SurveyResponseT;
  postingResponse?: boolean;
  /**
   * We track 3 possible states for last surveyed time:
   * - 'undefined': this means we don't know when the user was last surveyed.
   *  A network request is necessary in this case to see if they've previously
   *   been queried on another device.
   * - 'number': this is the unix time (in milliseconds) when the user was last
   *   surveyed.
   * - 'null': the user has never been surveyed before - this has been verified
   *   with a request to our server.
   */
  lastSurveyedMs?: number | null;
};

export class SurveyConfig {
  _data: TSurveyConfig;

  constructor(data: TSurveyConfig) {
    this._data = data;
  }

  public async shouldSurvey(): Promise<boolean> {
    let lastSurveyedMs = this.getLastSurveyTimeMs();

    // We're not sure if this user has been surveyed before -- we need to
    // confirm by double-checking with the network.
    if (lastSurveyedMs === undefined) {
      lastSurveyedMs = await this.getLastSurveyedTimeFromNetwork();
      this.setLastSurveyTimeMs(lastSurveyedMs);
    }

    // Even with the above request, something weird happened and the value
    // is still undefined. We'll try refreshing the value on the next submit
    // again.
    if (lastSurveyedMs === undefined) {
      return false;
    }

    // The user has never been surveyed before.
    if (lastSurveyedMs === null) {
      return true;
    }

    const comparison = Date.now() - MS_BETWEEN_SURVEYS;
    return lastSurveyedMs < comparison;
  }

  public async getLastSurveyedTimeFromNetwork(): Promise<
    number | null | undefined
  > {
    try {
      const authToken = cliAuthPrecondition();
      const response = await request.requestWithArgs(
        API_SERVER,
        graphiteCLIRoutes.lastSurveyTime,
        {},
        {
          authToken: authToken,
        }
      );
      if (response._response.status === 200) {
        // When the server passes back 'undefined', this means that it doesn't
        // think the user has been surveyed before; locally, we store this as
        // null.
        return response.lastSurveyedTime ?? null;
      }
    } catch (e) {
      // Ignore any background errors here; if this fails, then we'll try
      // again the next time a user runs a CLI command.
    }
    return undefined;
  }

  public setLastSurveyTimeMs(time: number | null | undefined): void {
    this._data.lastSurveyedMs = time;
  }

  public getLastSurveyTimeMs(): number | null | undefined {
    return this._data.lastSurveyedMs;
  }

  public setSurveyResponses(responses: SurveyResponseT): void {
    this._data.responses = responses;
    this.save();
  }

  public hasSurveyResponse(): boolean {
    return this._data.responses !== undefined;
  }

  public isPostingSurveyResponse(): boolean {
    return this._data.postingResponse ?? false;
  }

  public setPostingSurveyResponse(status: boolean): void {
    this._data.postingResponse = status;
    this.save();
  }

  private clearPriorSurveyResponse(): void {
    this._data.responses = undefined;
    this.save();
  }

  public async postResponses(): Promise<void> {
    try {
      const surveyResponse = this._data.responses;
      if (surveyResponse === undefined) {
        return;
      }

      const authToken = cliAuthPrecondition();

      const response = await request.requestWithArgs(
        API_SERVER,
        graphiteCLIRoutes.surveyResponse,
        {
          authToken: authToken,
          responses: {
            timestamp: surveyResponse.timestamp,
            responses: Object.keys(surveyResponse.responses).map(
              (question: string) => {
                return {
                  question: question,
                  response: surveyResponse.responses[question],
                };
              }
            ),
            exitedEarly: surveyResponse.exitedEarly,
          },
        }
      );

      if (response._response.status === 200) {
        this.setPostingSurveyResponse(false);
        this.clearPriorSurveyResponse();
      }
    } catch (e) {
      // Ignore any background errors posting the survey; if posting fails,
      // then we'll try again the next time a user runs a CLI command.
    }
  }

  public path(): string {
    return SURVEY_CONFIG_PATH;
  }

  private save(): void {
    if (this._data.responses !== undefined) {
      fs.writeFileSync(SURVEY_CONFIG_PATH, JSON.stringify(this._data));
      return;
    }

    // If we've reached this point, the survey config fields are empty - so we
    // clean up the now unnecessary file.
    SurveyConfig.deleteFile();
  }

  public delete(): void {
    this._data = {};
    SurveyConfig.deleteFile();
  }

  static deleteFile(): void {
    if (fs.existsSync(SURVEY_CONFIG_PATH)) {
      fs.unlinkSync(SURVEY_CONFIG_PATH);
      return;
    }
  }
}

function readSurveyConfig(): SurveyConfig {
  if (fs.existsSync(SURVEY_CONFIG_PATH)) {
    const raw = fs.readFileSync(SURVEY_CONFIG_PATH);
    try {
      const parsedConfig = JSON.parse(raw.toString().trim()) as TSurveyConfig;
      return new SurveyConfig(parsedConfig);
    } catch (e) {
      // There was some error so just silently clean up the file - hopefully
      // we'll fix the malformed survey config on the next creation/save.
      SurveyConfig.deleteFile();
    }
  }
  return new SurveyConfig({});
}

const surveyConfigSingleton = readSurveyConfig();
export default surveyConfigSingleton;
