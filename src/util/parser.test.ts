import { describe, test, expect } from "bun:test";
import { parseFieldsAndTemplate } from "./parser";

const makeTemplate = (qfmt: string, afmt: string) => ({
  qfmt,
  afmt,
  bqfmt: "",
  bafmt: "",
  name: "Test",
  ord: 0,
});

describe("parseFieldsAndTemplate", () => {
  test("replaces field placeholders in question and answer", () => {
    const result = parseFieldsAndTemplate(
      { Front: "Hello", Back: "World" },
      makeTemplate("{{Front}}", "{{Back}}"),
    );
    expect(result.question).toBe("Hello");
    expect(result.answer).toBe("World");
  });

  test("injects FrontSide into answer template", () => {
    const result = parseFieldsAndTemplate(
      { Front: "Question", Back: "Answer" },
      makeTemplate("{{Front}}", "{{FrontSide}}<br>{{Back}}"),
    );
    expect(result.answer).toBe("Question<br>Answer");
  });

  test("returns empty question and answer when question resolves to blank", () => {
    const result = parseFieldsAndTemplate({ Front: "" }, makeTemplate("{{Front}}", "{{Back}}"));
    expect(result.question).toBe("");
    expect(result.answer).toBe("");
  });

  test("returns empty question and answer when question is whitespace only", () => {
    const result = parseFieldsAndTemplate({ Front: "   " }, makeTemplate("{{Front}}", "Answer"));
    expect(result.question).toBe("");
    expect(result.answer).toBe("");
  });

  test("shows conditional block when field is non-empty", () => {
    const result = parseFieldsAndTemplate(
      { Front: "present" },
      makeTemplate("{{#Front}}shown{{/Front}}", ""),
    );
    expect(result.question).toBe("shown");
  });

  test("hides conditional block when field is empty", () => {
    const result = parseFieldsAndTemplate(
      { Front: "" },
      makeTemplate("{{#Front}}hidden{{/Front}}rest", "rest"),
    );
    expect(result.question).toBe("rest");
  });

  test("hides conditional block when field is whitespace only", () => {
    const result = parseFieldsAndTemplate(
      { Front: "   " },
      makeTemplate("{{#Front}}hidden{{/Front}}rest", "rest"),
    );
    expect(result.question).toBe("rest");
  });

  test("hides conditional block when field is missing", () => {
    const result = parseFieldsAndTemplate(
      {},
      makeTemplate("{{#Front}}hidden{{/Front}}rest", "rest"),
    );
    expect(result.question).toBe("rest");
  });

  test("renders field value inside conditional block", () => {
    const result = parseFieldsAndTemplate(
      { Word: "hello" },
      makeTemplate("{{#Word}}The word is: {{Word}}{{/Word}}", ""),
    );
    expect(result.question).toBe("The word is: hello");
  });

  test("replaces unknown fields with empty string", () => {
    const result = parseFieldsAndTemplate({}, makeTemplate("{{Unknown}}", "{{AlsoUnknown}}"));
    expect(result.question).toBe("");
    expect(result.answer).toBe("");
  });

  test("handles plain text with no placeholders", () => {
    const result = parseFieldsAndTemplate(
      { Front: "irrelevant" },
      makeTemplate("Plain question", "Plain answer"),
    );
    expect(result.question).toBe("Plain question");
    expect(result.answer).toBe("Plain answer");
  });

  test("handles multiple field replacements in a single template", () => {
    const result = parseFieldsAndTemplate(
      { A: "foo", B: "bar", C: "baz" },
      makeTemplate("{{A}} {{B}} {{C}}", "{{C}} {{B}} {{A}}"),
    );
    expect(result.question).toBe("foo bar baz");
    expect(result.answer).toBe("baz bar foo");
  });

  test("handles HTML content in field values", () => {
    const result = parseFieldsAndTemplate(
      { Front: "<b>bold</b>" },
      makeTemplate("{{Front}}", "{{Front}}"),
    );
    expect(result.question).toBe("<b>bold</b>");
  });

  test("does not mutate the original fields object", () => {
    const fields = { Front: "Q", Back: "A" };
    parseFieldsAndTemplate(fields, makeTemplate("{{Front}}", "{{FrontSide}}"));
    expect(fields).not.toHaveProperty("FrontSide");
  });
});
