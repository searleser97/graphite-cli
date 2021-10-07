import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import { expect } from "chai";
import nock from "nock";
import prompts from "prompts";
import { API_SERVER } from "../../../src/lib/api";
import surveyConfig, {
  MS_BETWEEN_SURVEYS,
} from "../../../src/lib/config/survey_config";
import { survey } from "../../../src/lib/telemetry/survey/survey";
import { BasicScene } from "../../lib/scenes";
import { configureTest } from "../../lib/utils";

for (const scene of [new BasicScene()]) {
  // eslint-disable-next-line max-lines-per-function
  describe(`(${scene}): survey`, function () {
    configureTest(this, scene);

    beforeEach(() => {
      surveyConfig.delete();
      if (!nock.isActive()) {
        nock.activate();
      }
    });

    afterEach(() => {
      nock.cleanAll();
      nock.restore();
    });

    it("If there is no local last survey time, when the server returns no recorded last survey time, it serves a survey", async () => {
      const lastSurveyedTime = null;
      nock(API_SERVER)
        .persist()
        .get(graphiteCLIRoutes.lastSurveyTime.url)
        .query(true)
        .reply(200, {
          lastSurveyedTime: lastSurveyedTime,
        });
      expect(await surveyConfig.getLastSurveyedTimeFromNetwork()).to.be.null;
      const shouldSurvey = await surveyConfig.shouldSurvey();
      expect(shouldSurvey).to.be.true;
    });

    it("If there is no local last survey time, when the server returns a survey time outside of the survey window, it serves a survey", async () => {
      const lastSurveyedTime = Date.now() - MS_BETWEEN_SURVEYS - 100;
      nock(API_SERVER)
        .persist()
        .get(graphiteCLIRoutes.lastSurveyTime.url)
        .query(true)
        .reply(200, {
          lastSurveyedTime: lastSurveyedTime,
        });
      expect(await surveyConfig.getLastSurveyedTimeFromNetwork()).to.eq(
        lastSurveyedTime
      );
      const shouldSurvey = await surveyConfig.shouldSurvey();
      expect(shouldSurvey).to.be.true;
    });

    it("If there is no local last survey time, when the server returns a survey time inside the survey window, it does not serve a survey", async () => {
      const lastSurveyedTime = Date.now() - MS_BETWEEN_SURVEYS + 100;
      nock(API_SERVER)
        .persist()
        .get(graphiteCLIRoutes.lastSurveyTime.url)
        .query(true)
        .reply(200, {
          lastSurveyedTime: lastSurveyedTime,
        });
      expect(await surveyConfig.getLastSurveyedTimeFromNetwork()).to.eq(
        lastSurveyedTime
      );
      const shouldSurvey = await surveyConfig.shouldSurvey();
      expect(shouldSurvey).to.be.false;
    });

    it("If the local last survey time is within the survey window, it does not serve a survey", async () => {
      surveyConfig.setLastSurveyTimeMs(Date.now() - MS_BETWEEN_SURVEYS + 100);
      const shouldSurvey = await surveyConfig.shouldSurvey();
      expect(shouldSurvey).to.be.false;
    });

    it("If the local last survey time is outside the survey window, serves a survey", async () => {
      surveyConfig.setLastSurveyTimeMs(Date.now() - MS_BETWEEN_SURVEYS - 100);
      const shouldSurvey = await surveyConfig.shouldSurvey();
      expect(shouldSurvey).to.be.true;
    });

    it("After a user is surveyed, should survey should be false", async () => {
      surveyConfig.setLastSurveyTimeMs(Date.now() - MS_BETWEEN_SURVEYS - 100);
      let shouldSurvey = await surveyConfig.shouldSurvey();
      expect(shouldSurvey).to.be.true;

      prompts.inject(["Very disappointed", "test", "test", "test"]);
      await survey();

      shouldSurvey = await surveyConfig.shouldSurvey();
      expect(shouldSurvey).to.be.false;
    });
  });
}
