import prompts from "prompts";
import surveyConfig from "../../config/survey_config";
import { logMessageFromGraphite, logNewline } from "../../utils";

type SurveyQuestionsT = (
  | {
      question: string;
      options: string[];
    }
  | {
      question: string;
    }
)[];

class ExitedSurveyError extends Error {
  constructor() {
    super(`User exited Graphite survey early`);
    this.name = "Killed";
  }
}

const questions: SurveyQuestionsT = [
  {
    question: "How would you feel if you could no longer use the Graphite CLI?",
    options: ["Very disappointed", "Somewhat disappointed", "Not disappointed"],
  },
  {
    question:
      "What type of people do you think would most benefit from the Graphite CLI?",
  },
  {
    question: "What is the main benefit you receive from the Graphite CLI?",
  },
  {
    question: "How can we improve the Graphite CLI for you?",
  },
];

export type SurveyResponseT = {
  timestamp: number;
  responses: { [question: string]: string };
  exitedEarly: boolean;
};

export async function survey(): Promise<void> {
  let responses: SurveyResponseT = {
    timestamp: Date.now(),
    responses: {},
    exitedEarly: false,
  };
  try {
    await askSurvey(responses);
    logAnswers(responses);
  } catch (err) {
    switch (err.constructor) {
      case ExitedSurveyError:
        responses.exitedEarly = true;
        logAnswers(responses);
        break;
      default:
        throw err;
    }
  }
}

/**
 * While capturing the responses, mutate the passed-in object so we can always
 * capture and potential responses before the user decided to exit the survey
 * early.
 */
async function askSurvey(responses: SurveyResponseT): Promise<void> {
  surveyConfig.setLastSurveyTimeMs(Date.now());

  logNewline();
  logMessageFromGraphite(
    [
      "Thanks for participating in the Graphite CLI beta! 😊",
      "",
      "Every two weeks, we'll ask you a series of questions to determine how we can best extend our CLI to continue serving you. Thanks in advance for your help!",
      "",
      "- the Graphite creators",
    ].join("\n")
  );

  for (const [index, question] of questions.entries()) {
    const onCancel = {
      onCancel: () => {
        throw new ExitedSurveyError();
      },
    };

    let promptResponse;
    const questionText = `Question [${index + 1}/${questions.length}]: ${
      question.question
    }`;
    if ("options" in question) {
      promptResponse = await prompts(
        {
          type: "select",
          name: "answer",
          message: questionText,
          choices: question.options.map((option) => {
            return {
              title: option,
              value: option,
            };
          }),
        },
        onCancel
      );
    } else {
      promptResponse = await prompts(
        {
          type: "text",
          name: "answer",
          message: questionText,
        },
        onCancel
      );
    }

    // Add newline after each response to create visual separation to next
    // question.
    logNewline();

    responses.responses[question.question] = promptResponse.answer;
  }
}

async function logAnswers(responses: SurveyResponseT): Promise<void> {
  surveyConfig.setSurveyResponses(responses);
}
