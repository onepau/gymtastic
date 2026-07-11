import {
  classifyArticleRequest,
  classifyEventType,
  classifyAthleteRelated,
} from "./classify";
import {
  runOrchestrator,
  runCompetitionResults,
  runAthleteData,
  runArticleWriter,
  runEditorialQA,
  runFallback,
} from "./agents";
import { vectorUpsert } from "./vectorize";

export interface WorkflowInput {
  input_as_text: string;
}

export async function runWorkflow(workflow: WorkflowInput) {
  const input = workflow.input_as_text;

  const { category: articleCheck } = await classifyArticleRequest(input);
  if (articleCheck !== "is_article_request") {
    return { output_text: await runFallback(input) };
  }

  const orchestratorContext = await runOrchestrator(input);

  const { category: eventType } = await classifyEventType(input);

  if (eventType === "Specific event") {
    const resultsOutput = await runCompetitionResults(
      `${input}\n\nOrchestrator context:\n${orchestratorContext}`,
    );
    vectorUpsert("competition", input, resultsOutput).catch(() => {});

    // NOTE: the original workflow also ran a 05 Image embedding step here before
    // article writing. Deliberately omitted — see MIGRATION_NOTES.md.
    const articleRaw = await runArticleWriter(
      `${input}\n\nCompetition results:\n${resultsOutput}`,
    );

    // Article writer is instructed to return JSON — parse it so downstream
    // steps (gymbot-to-d1.js, GitHub Actions) can insert structured fields.
    let article: {
      title?: string;
      meta_description?: string;
      body_html?: string;
    } = {};
    try {
      const cleaned = articleRaw
        .replace(/^```[\w]*\n?/m, "")
        .replace(/\n?```$/m, "")
        .trim();
      article = JSON.parse(cleaned);
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

  const { category: athleteCheck } = await classifyAthleteRelated(input);
  if (athleteCheck === "athlete_related") {
    const athleteOutput = await runAthleteData(
      `${input}\n\nOrchestrator context:\n${orchestratorContext}`,
    );
    vectorUpsert("athlete", input, athleteOutput).catch(() => {});
    return { output_text: athleteOutput };
  }

  return { output_text: await runFallback(input) };
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
