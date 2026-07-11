import { classifyEventType, classifyAthleteRelated } from "./classify";
import {
  runOrchestrator,
  runCompetitionResults,
  runAthleteData,
  runArticleWriter,
  runEditorialQA,
} from "./agents";
import { vectorUpsert } from "./vectorize";

export interface WorkflowInput {
  input_as_text: string;
}

function parseArticleJson(raw: string) {
  const cleaned = raw
    .replace(/^```[\w]*\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();
  return JSON.parse(cleaned) as {
    title?: string;
    meta_description?: string;
    body_html?: string;
  };
}

export async function runWorkflow(workflow: WorkflowInput) {
  const input = workflow.input_as_text;

  const orchestratorContext = await runOrchestrator(input);
  const { category: eventType } = await classifyEventType(input);

  let researchContext: string;

  if (eventType === "Specific event") {
    const resultsOutput = await runCompetitionResults(
      `${input}\n\nOrchestrator context:\n${orchestratorContext}`,
    );
    vectorUpsert("competition", input, resultsOutput).catch(() => {});
    researchContext = `Competition results:\n${resultsOutput}`;
  } else {
    const { category: athleteCheck } = await classifyAthleteRelated(input);
    if (athleteCheck === "athlete_related") {
      const athleteOutput = await runAthleteData(
        `${input}\n\nOrchestrator context:\n${orchestratorContext}`,
      );
      vectorUpsert("athlete", input, athleteOutput).catch(() => {});
      researchContext = `Athlete data:\n${athleteOutput}`;
    } else {
      researchContext = `Orchestrator context:\n${orchestratorContext}`;
    }
  }

  // NOTE: the original workflow also ran a 05 Image embedding step here before
  // article writing. Deliberately omitted — see MIGRATION_NOTES.md.
  const articleRaw = await runArticleWriter(`${input}\n\n${researchContext}`);

  let article: {
    title?: string;
    meta_description?: string;
    body_html?: string;
  } = {};
  try {
    article = parseArticleJson(articleRaw);
  } catch {
    return { output_text: articleRaw };
  }

  const qaOutput = await runEditorialQA(article.body_html ?? articleRaw);
  const approved = /\bApproved\b/i.test(qaOutput);

  return {
    output_text: qaOutput,
    ...(approved && article.title
      ? {
          title: article.title,
          meta_description: article.meta_description ?? "",
          body_html: article.body_html ?? "",
          qa_approved: true,
        }
      : {}),
  };
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
