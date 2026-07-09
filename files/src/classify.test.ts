import { describe, it, expect } from "vitest";
import {
  classifyGymnastics,
  classifyEventType,
  classifyAthleteRelated,
  classifyArticleRequest,
} from "./classify";

describe("classifyGymnastics", () => {
  it("gymnastics question → gymnastics_related", async () => {
    const r = await classifyGymnastics(
      "who won gold at the 2025 Artistic Gymnastics World Championships",
    );
    expect(r.category).toBe("gymnastics_related");
  });

  it("weather question → non_gymnastics_related", async () => {
    const r = await classifyGymnastics("what is the weather like today?");
    expect(r.category).toBe("non_gymnastics_related");
  });

  it("holiday booking → non_gymnastics_related", async () => {
    const r = await classifyGymnastics("book me a holiday in Dubai");
    expect(r.category).toBe("non_gymnastics_related");
  });

  it("athlete profile request → gymnastics_related", async () => {
    const r = await classifyGymnastics(
      "write an athlete profile on Simone Biles",
    );
    expect(r.category).toBe("gymnastics_related");
  });

  it("trampoline world championships → gymnastics_related", async () => {
    const r = await classifyGymnastics(
      "Write a 300 word summary of the 2026 Trampoline Gymnastics World Championships",
    );
    expect(r.category).toBe("gymnastics_related");
  });
});

describe("classifyEventType", () => {
  it("specific event with year → Specific event", async () => {
    const r = await classifyEventType(
      "Who won gold at the 2025 Artistic Gymnastics World Championships",
    );
    expect(r.category).toBe("Specific event");
  });

  it("named future event → Specific event", async () => {
    const r = await classifyEventType(
      "Write a preview for the 2026 Acrobatic Gymnastics World Championships",
    );
    expect(r.category).toBe("Specific event");
  });

  it("vague best-gymnast question → General", async () => {
    const r = await classifyEventType("Who's the best gymnast?");
    expect(r.category).toBe("General");
  });

  it("medal count question → General", async () => {
    const r = await classifyEventType(
      "How many gold medals does Simone Biles have?",
    );
    expect(r.category).toBe("General");
  });

  it("nearest club question → General", async () => {
    const r = await classifyEventType("Where is my nearest gymnastics club?");
    expect(r.category).toBe("General");
  });
});

describe("classifyAthleteRelated", () => {
  it("age question about athlete → athlete_related", async () => {
    const r = await classifyAthleteRelated("How old is Simone Biles?");
    expect(r.category).toBe("athlete_related");
  });

  it("profile request → athlete_related", async () => {
    const r = await classifyAthleteRelated(
      "Write a profile on gymnast Ethan McGuinness",
    );
    expect(r.category).toBe("athlete_related");
  });

  it("country medal tally → non_athlete related", async () => {
    const r = await classifyAthleteRelated(
      "How many medals did Germany win at the 2025 Artistic Gymnastics World Championships?",
    );
    expect(r.category).toBe("non_athlete related");
  });

  it("schedule question → non_athlete related", async () => {
    const r = await classifyAthleteRelated(
      "When is the next World Gymnastics world championships event?",
    );
    expect(r.category).toBe("non_athlete related");
  });
});

describe("classifyArticleRequest", () => {
  it("preview request → is_article_request", async () => {
    const r = await classifyArticleRequest(
      "Write me a preview for gymnastics at the Olympic Games",
    );
    expect(r.category).toBe("is_article_request");
  });

  it("athlete profile request → is_article_request", async () => {
    const r = await classifyArticleRequest(
      "Write an athlete profile on Sunisa Lee",
    );
    expect(r.category).toBe("is_article_request");
  });

  it("age question → is_not_article_request", async () => {
    const r = await classifyArticleRequest("How old is Daiki Hashimoto");
    expect(r.category).toBe("is_not_article_request");
  });

  it("medal count question → is_not_article_request", async () => {
    const r = await classifyArticleRequest(
      "How many gold medals has Simone Biles won?",
    );
    expect(r.category).toBe("is_not_article_request");
  });
});
