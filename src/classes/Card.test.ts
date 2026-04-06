import { describe, test, expect } from "bun:test";
import { Card } from "./Card";
import { Model } from "./Model";

const makeModel = (fieldNames: string[], templates: { qfmt: string; afmt: string }[] = []) =>
  new Model("model1", {
    name: "TestModel",
    css: "",
    type: 0,
    latexPre: "",
    latexPost: "",
    flds: fieldNames.map((name, ord) => ({ name, ord, font: "Arial", size: 20, sticky: false })),
    tmpls: templates.map((t, ord) => ({
      ...t,
      bqfmt: "",
      bafmt: "",
      name: `Card ${ord + 1}`,
      ord,
    })),
  });

const makeCollection = (model: Model) => ({ getModels: () => ({ model1: model }) }) as any;

const makeCardData = (overrides: Record<string, any> = {}) => ({
  did: 100,
  nid: 200,
  mid: "model1",
  flds: "Front Value\x1fBack Value",
  ...overrides,
});

describe("Card", () => {
  test("getId returns the card id", () => {
    const card = new Card("42", makeCardData(), makeCollection(makeModel(["Front", "Back"])));
    expect(card.getId()).toBe("42");
  });

  test("getDeckId returns deck id from card data", () => {
    const card = new Card("1", makeCardData({ did: 999 }), makeCollection(makeModel(["Front"])));
    expect(card.getDeckId()).toBe("999");
  });

  test("getNoteId returns note id from card data", () => {
    const card = new Card("1", makeCardData({ nid: 555 }), makeCollection(makeModel(["Front"])));
    expect(card.getNoteId()).toBe("555");
  });

  test("getRawFields returns the raw unit-separated field string", () => {
    const card = new Card("1", makeCardData(), makeCollection(makeModel(["Front", "Back"])));
    expect(card.getRawFields()).toBe("Front Value\x1fBack Value");
  });

  test("getOrderedFields splits on unit separator", () => {
    const card = new Card("1", makeCardData(), makeCollection(makeModel(["Front", "Back"])));
    expect(card.getOrderedFields()).toEqual(["Front Value", "Back Value"]);
  });

  test("getOrderedFields returns a new copy each call", () => {
    const card = new Card("1", makeCardData(), makeCollection(makeModel(["Front", "Back"])));
    expect(card.getOrderedFields()).not.toBe(card.getOrderedFields());
  });

  test("getFront returns the first field", () => {
    const card = new Card("1", makeCardData(), makeCollection(makeModel(["Front", "Back"])));
    expect(card.getFront()).toBe("Front Value");
  });

  test("getBack returns the second field", () => {
    const card = new Card("1", makeCardData(), makeCollection(makeModel(["Front", "Back"])));
    expect(card.getBack()).toBe("Back Value");
  });

  test("getModelId returns model id from card data", () => {
    const card = new Card("1", makeCardData(), makeCollection(makeModel(["Front"])));
    expect(card.getModelId()).toBe("model1");
  });

  test("getModel returns the Model from the collection", () => {
    const model = makeModel(["Front", "Back"]);
    const card = new Card("1", makeCardData(), makeCollection(model));
    expect(card.getModel()).toBe(model);
  });

  test("getFields maps model field names to ordered values", () => {
    const model = makeModel(["Front", "Back"]);
    const card = new Card("1", makeCardData(), makeCollection(model));
    expect(card.getFields()).toEqual({ Front: "Front Value", Back: "Back Value" });
  });

  test("getFields stops at model field count when fewer model fields exist", () => {
    const model = makeModel(["OnlyFront"]);
    const card = new Card("1", makeCardData(), makeCollection(model));
    const fields = card.getFields();
    expect(Object.keys(fields)).toHaveLength(1);
    expect(fields.OnlyFront).toBe("Front Value");
  });

  test("getFields returns a new copy each call", () => {
    const model = makeModel(["Front", "Back"]);
    const card = new Card("1", makeCardData(), makeCollection(model));
    expect(card.getFields()).not.toBe(card.getFields());
    expect(card.getFields()).toEqual(card.getFields());
  });

  test("getQuestions generates one Question per non-empty template", () => {
    const model = makeModel(
      ["Front", "Back"],
      [{ qfmt: "{{Front}}", afmt: "{{FrontSide}}<hr>{{Back}}" }],
    );
    const card = new Card("1", makeCardData(), makeCollection(model));
    const questions = card.getQuestions();
    expect(questions).toHaveLength(1);
    expect(questions[0]!.getQuestionString()).toBe("Front Value");
  });

  test("getQuestions skips templates that produce an empty question", () => {
    const model = makeModel(
      ["Front", "Back"],
      [
        { qfmt: "{{MissingField}}", afmt: "{{Back}}" },
        { qfmt: "{{Front}}", afmt: "{{Back}}" },
      ],
    );
    const card = new Card("1", makeCardData(), makeCollection(model));
    const questions = card.getQuestions();
    expect(questions).toHaveLength(1);
    expect(questions[0]!.getQuestionString()).toBe("Front Value");
  });

  test("getQuestions returns a new copy each call", () => {
    const model = makeModel(["Front"], [{ qfmt: "{{Front}}", afmt: "{{Front}}" }]);
    const card = new Card("1", makeCardData(), makeCollection(model));
    expect(card.getQuestions()).not.toBe(card.getQuestions());
  });

  test("getRawCard returns the original card data object", () => {
    const data = makeCardData();
    const card = new Card("1", data, makeCollection(makeModel(["Front"])));
    expect(card.getRawCard()).toBe(data);
  });
});
