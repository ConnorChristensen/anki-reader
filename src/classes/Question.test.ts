import { describe, test, expect } from "bun:test";
import { Question } from "./Question";
import { Model } from "./Model";

const makeModel = (css = "", latexPre = "", latexPost = "") =>
  new Model("1", { name: "Test", css, latexPre, latexPost, type: 0, flds: [], tmpls: [] });

const makeTemplate = (qfmt: string, afmt: string) => ({
  qfmt,
  afmt,
  bqfmt: "",
  bafmt: "",
  name: "Card 1",
  ord: 0,
});

describe("Question", () => {
  test("getQuestionString returns the parsed question", () => {
    const q = new Question({ Front: "Hello" }, makeTemplate("{{Front}}", "{{Back}}"), makeModel());
    expect(q.getQuestionString()).toBe("Hello");
  });

  test("getAnswerString returns the parsed answer", () => {
    const q = new Question(
      { Front: "Hello", Back: "World" },
      makeTemplate("{{Front}}", "{{Back}}"),
      makeModel(),
    );
    expect(q.getAnswerString()).toBe("World");
  });

  test("getAnswerString resolves FrontSide to the parsed question", () => {
    const q = new Question(
      { Front: "Q", Back: "A" },
      makeTemplate("{{Front}}", "{{FrontSide}}<hr>{{Back}}"),
      makeModel(),
    );
    expect(q.getAnswerString()).toBe("Q<hr>A");
  });

  test("getQuestion returns IFormattedString with rawValue as qfmt", () => {
    const template = makeTemplate("{{Front}}", "{{Back}}");
    const q = new Question({ Front: "Hello" }, template, makeModel());
    const result = q.getQuestion();
    expect(result.rawValue).toBe("{{Front}}");
    expect(result.formattedString).toBe("Hello");
  });

  test("getQuestion wraps formattedString with latex pre/post", () => {
    const q = new Question(
      { Front: "Hi" },
      makeTemplate("{{Front}}", ""),
      makeModel("", "PRE", "POST"),
    );
    expect(q.getQuestion().latexFormattedString).toBe("PREHiPOST");
  });

  test("getAnswer returns IFormattedString with rawValue as afmt", () => {
    const template = makeTemplate("{{Front}}", "{{Back}}");
    const q = new Question({ Front: "Q", Back: "A" }, template, makeModel());
    const result = q.getAnswer();
    expect(result.rawValue).toBe("{{Back}}");
    expect(result.formattedString).toBe("A");
  });

  test("getAnswer wraps formattedString with latex pre/post", () => {
    const q = new Question(
      { Front: "Q", Back: "A" },
      makeTemplate("{{Front}}", "{{Back}}"),
      makeModel("", "PRE", "POST"),
    );
    expect(q.getAnswer().latexFormattedString).toBe("PREAPOST");
  });

  test("getCss delegates to model", () => {
    const q = new Question(
      {},
      makeTemplate("text", "text"),
      makeModel(".card { font-size: 20px; }"),
    );
    expect(q.getCss()).toBe(".card { font-size: 20px; }");
  });

  test("getLatexPre and getLatexPost delegate to model", () => {
    const q = new Question({}, makeTemplate("text", "text"), makeModel("", "\\pre", "\\post"));
    expect(q.getLatexPre()).toBe("\\pre");
    expect(q.getLatexPost()).toBe("\\post");
  });

  test("getRawTemplate returns a copy of the template", () => {
    const template = makeTemplate("{{Front}}", "{{Back}}");
    const q = new Question({ Front: "Hi" }, template, makeModel());
    const raw = q.getRawTemplate();
    expect(raw).toEqual(template);
    expect(raw).not.toBe(template);
  });

  test("getQuestion returns a new copy each call", () => {
    const q = new Question({ Front: "Hi" }, makeTemplate("{{Front}}", "{{Back}}"), makeModel());
    expect(q.getQuestion()).not.toBe(q.getQuestion());
    expect(q.getQuestion()).toEqual(q.getQuestion());
  });

  test("getAnswer returns a new copy each call", () => {
    const q = new Question(
      { Front: "Hi", Back: "Bye" },
      makeTemplate("{{Front}}", "{{Back}}"),
      makeModel(),
    );
    expect(q.getAnswer()).not.toBe(q.getAnswer());
    expect(q.getAnswer()).toEqual(q.getAnswer());
  });
});
