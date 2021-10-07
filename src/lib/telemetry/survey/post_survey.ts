import cp from "child_process";
import surveyConfig from "../../config/survey_config";

export async function postSurveyResponsesInBackground(): Promise<void> {
  if (surveyConfig.hasSurveyResponse()) {
    // Try to minimize racing if there are multiple commands fired in
    // short-sequence.
    if (surveyConfig.isPostingSurveyResponse()) {
      return;
    } else {
      surveyConfig.setPostingSurveyResponse(true);
    }

    cp.spawn("/usr/bin/env", ["node", __filename], {
      detached: true,
      stdio: "ignore",
    });
  }
}

async function postSurveyResponse(): Promise<void> {
  await surveyConfig.postResponses();
}

if (process.argv[1] === __filename) {
  void postSurveyResponse();
}
