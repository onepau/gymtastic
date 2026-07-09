import { screenInput } from "./guardrails";
import {
  classifyGymnastics,
  classifyArticleRequest,
  classifyEventType,
  classifyAthleteRelated
} from "./classify";
import {
  runOrchestrator,
  runCompetitionResults,
  runAthleteData,
  runArticleWriter,
  runEditorialQA,
  runFallback
} from "./agents";

export interface WorkflowInput {
  input_as_text: string;
}

export async function runWorkflow(workflow: WorkflowInput) {
  const guardrails = await screenInput(workflow.input_as_text);
  if (guardrails.hasTripwire) {
    return guardrails.failOutput;
  }
  const safeInput = guardrails.safeText;

  const { category: topLevel } = await classifyGymnastics(safeInput);
  if (topLevel !== "gymnastics_related") {
    return { output_text: await runFallback(safeInput) };
  }

  const { category: articleCheck } = await classifyArticleRequest(safeInput);
  if (articleCheck !== "is_article_request") {
    return { output_text: await runFallback(safeInput) };
  }

  const orchestratorContext = await runOrchestrator(safeInput);

  const { category: eventType } = await classifyEventType(safeInput);

  if (eventType === "Specific event") {
    const resultsOutput = await runCompetitionResults(
      `${safeInput}\n\nOrchestrator context:\n${orchestratorContext}`
    );
    // NOTE: the original workflow also ran a 05 Image embedding step here before
    // article writing. Deliberately omitted — see MIGRATION_NOTES.md.
    const articleOutput = await runArticleWriter(
      `${safeInput}\n\nCompetition results:\n${resultsOutput}`
    );
    const qaOutput = await runEditorialQA(articleOutput);
    return { output_text: qaOutput };
  }

  const { category: athleteCheck } = await classifyAthleteRelated(safeInput);
  if (athleteCheck === "athlete_related") {
    const athleteOutput = await runAthleteData(
      `${safeInput}\n\nOrchestrator context:\n${orchestratorContext}`
    );
    return { output_text: athleteOutput };
  }

  return { output_text: await runFallback(safeInput) };
}

// Local test entrypoint: `npm start "your query here"`
if (import.meta.url === `file://${process.argv[1]}`) {
  const query = process.argv[2] ?? "Write an athlete profile on Simone Biles";
  runWorkflow({ input_as_text: query })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
