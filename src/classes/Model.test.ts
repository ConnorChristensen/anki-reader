import { describe, test, expect } from "bun:test";
import { Model } from "./Model";

const fullModelJson = {
  name: "Basic",
  css: ".card { color: red; }",
  type: 0,
  latexPre: "\\documentclass{article}",
  latexPost: "\\end{document}",
  flds: [
    { name: "Front", ord: 0, font: "Arial", size: 20, sticky: false },
    { name: "Back", ord: 1, font: "Arial", size: 20, sticky: false },
  ],
  tmpls: [
    {
      name: "Card 1",
      ord: 0,
      qfmt: "{{Front}}",
      afmt: "{{FrontSide}}<hr id=answer>{{Back}}",
      bqfmt: "",
      bafmt: "",
    },
  ],
};

describe("Model", () => {
  test("getId returns the constructor id", () => {
    const model = new Model("123", fullModelJson);
    expect(model.getId()).toBe("123");
  });

  test("getName returns model name", () => {
    const model = new Model("1", fullModelJson);
    expect(model.getName()).toBe("Basic");
  });

  test("getCss returns css string", () => {
    const model = new Model("1", fullModelJson);
    expect(model.getCss()).toBe(".card { color: red; }");
  });

  test("getType returns type number", () => {
    const model = new Model("1", fullModelJson);
    expect(model.getType()).toBe(0);
  });

  test("getLatexPre returns latex preamble", () => {
    const model = new Model("1", fullModelJson);
    expect(model.getLatexPre()).toBe("\\documentclass{article}");
  });

  test("getLatexPost returns latex postamble", () => {
    const model = new Model("1", fullModelJson);
    expect(model.getLatexPost()).toBe("\\end{document}");
  });

  test("getFields returns array of model fields", () => {
    const model = new Model("1", fullModelJson);
    const fields = model.getFields();
    expect(fields).toHaveLength(2);
    expect(fields[0]!.name).toBe("Front");
    expect(fields[1]!.name).toBe("Back");
  });

  test("getFields returns a new copy each call", () => {
    const model = new Model("1", fullModelJson);
    expect(model.getFields()).not.toBe(model.getFields());
    expect(model.getFields()).toEqual(model.getFields());
  });

  test("getTemplates returns array of templates", () => {
    const model = new Model("1", fullModelJson);
    const templates = model.getTemplates();
    expect(templates).toHaveLength(1);
    expect(templates[0]!.name).toBe("Card 1");
    expect(templates[0]!.qfmt).toBe("{{Front}}");
  });

  test("getTemplates returns a new copy each call", () => {
    const model = new Model("1", fullModelJson);
    expect(model.getTemplates()).not.toBe(model.getTemplates());
    expect(model.getTemplates()).toEqual(model.getTemplates());
  });

  test("getRawModel returns a shallow copy of the model json", () => {
    const model = new Model("1", fullModelJson);
    const raw = model.getRawModel();
    expect(raw).toEqual(fullModelJson);
    expect(raw).not.toBe(fullModelJson);
  });

  test("missing string fields default to empty string", () => {
    const model = new Model("1", {});
    expect(model.getName()).toBe("");
    expect(model.getCss()).toBe("");
    expect(model.getLatexPre()).toBe("");
    expect(model.getLatexPost()).toBe("");
  });

  test("missing type defaults to 0", () => {
    const model = new Model("1", {});
    expect(model.getType()).toBe(0);
  });

  test("missing flds and tmpls default to empty arrays", () => {
    const model = new Model("1", {});
    expect(model.getFields()).toEqual([]);
    expect(model.getTemplates()).toEqual([]);
  });
});
