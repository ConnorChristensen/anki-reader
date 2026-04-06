import { describe, test, expect, beforeAll } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { readAnkiCollection, readAnkiPackage } from "../src/index";
import type { AnkiCollection } from "../src/classes/AnkiCollection";

const TEST_DIR = join(import.meta.dir);

// ---------------------------------------------------------------------------
// Amino Acid Flashcards — loaded from extracted collection.anki2
// ---------------------------------------------------------------------------

describe("Amino Acid Flashcards (collection.anki2)", () => {
  let collection: AnkiCollection;

  beforeAll(async () => {
    const buf = readFileSync(join(TEST_DIR, "Amino_Acid_Flashcards", "collection.anki2"));
    collection = await readAnkiCollection(new Uint8Array(buf));
  });

  test("reads a valid collection", () => {
    expect(collection).toBeDefined();
  });

  test("collection version is 11", () => {
    expect(collection.getVersion()).toBe(11);
  });

  test("contains the Amino Acids deck", () => {
    const decks = collection.getDecks();
    const names = Object.values(decks).map((d) => d.getName());
    expect(names).toContain("Classes::CBIO 3400::Amino Acids");
  });

  test("Amino Acids deck has 107 cards", () => {
    const decks = collection.getDecks();
    const deck = Object.values(decks).find(
      (d) => d.getName() === "Classes::CBIO 3400::Amino Acids",
    )!;
    expect(Object.keys(deck.getCards())).toHaveLength(107);
  });

  test("contains the Molecular Compound model", () => {
    const models = collection.getModels();
    const names = Object.values(models).map((m) => m.getName());
    expect(names).toContain("Molecular Compound");
  });

  test("Molecular Compound model has the expected fields", () => {
    const models = collection.getModels();
    const model = Object.values(models).find((m) => m.getName() === "Molecular Compound")!;
    const fieldNames = model.getFields().map((f) => f.name);
    expect(fieldNames).toEqual([
      "FullName",
      "ThreeLetter",
      "OneLetter",
      "Image",
      "ChemicalType",
      "Notes",
      "R-Group-pKa",
    ]);
  });

  test("Molecular Compound model has the expected templates", () => {
    const models = collection.getModels();
    const model = Object.values(models).find((m) => m.getName() === "Molecular Compound")!;
    const templateNames = model.getTemplates().map((t) => t.name);
    expect(templateNames).toEqual([
      "Structure",
      "FullName",
      "ThreeLetter",
      "OneLetter",
      "ChemicalType",
      "R Group pKa",
    ]);
  });

  test("alanine card has correct field values", () => {
    const decks = collection.getDecks();
    const deck = Object.values(decks).find(
      (d) => d.getName() === "Classes::CBIO 3400::Amino Acids",
    )!;
    const cards = deck.getCards();
    const alanine = Object.values(cards).find((c) => c.getFields().FullName === "alanine")!;
    expect(alanine).toBeDefined();
    expect(alanine.getFields().ThreeLetter).toBe("ala");
    expect(alanine.getFields().OneLetter).toBe("a");
    expect(alanine.getFields().ChemicalType).toBe("nonpolar");
  });

  test("alanine card generates questions from templates", () => {
    const decks = collection.getDecks();
    const deck = Object.values(decks).find(
      (d) => d.getName() === "Classes::CBIO 3400::Amino Acids",
    )!;
    const alanine = Object.values(deck.getCards()).find(
      (c) => c.getFields().FullName === "alanine",
    )!;
    const questions = alanine.getQuestions();
    expect(questions.length).toBeGreaterThan(0);
  });

  test("question answer contains the field value", () => {
    const decks = collection.getDecks();
    const deck = Object.values(decks).find(
      (d) => d.getName() === "Classes::CBIO 3400::Amino Acids",
    )!;
    const alanine = Object.values(deck.getCards()).find(
      (c) => c.getFields().FullName === "alanine",
    )!;
    const questions = alanine.getQuestions();
    const fullNameQuestion = questions.find((q) => q.getAnswerString().includes("alanine"));
    expect(fullNameQuestion).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Amino Acid Flashcards — loaded from .apkg (ZIP) file
// ---------------------------------------------------------------------------

describe("Amino Acid Flashcards (.apkg)", () => {
  let collection: AnkiCollection;
  let media: Record<string, Blob>;

  beforeAll(async () => {
    const buf = readFileSync(join(TEST_DIR, "Amino_Acid_Flashcards.apkg"));
    ({ collection, media } = await readAnkiPackage(new Blob([buf])));
  });

  test("reads collection from .apkg", () => {
    expect(collection).toBeDefined();
  });

  test("extracts 20 media files", () => {
    expect(Object.keys(media)).toHaveLength(20);
  });

  test("media files are Blobs", () => {
    for (const blob of Object.values(media)) {
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    }
  });

  test("media filenames are jpg images", () => {
    for (const key of Object.keys(media)) {
      expect(key).toMatch(/\.jpg$/);
    }
  });

  test("collection matches the .anki2 version", () => {
    expect(collection.getVersion()).toBe(11);
  });

  test("Amino Acids deck has 107 cards", () => {
    const decks = collection.getDecks();
    const deck = Object.values(decks).find(
      (d) => d.getName() === "Classes::CBIO 3400::Amino Acids",
    )!;
    expect(Object.keys(deck.getCards())).toHaveLength(107);
  });
});

// ---------------------------------------------------------------------------
// World Capitals — loaded from extracted collection.anki2
// ---------------------------------------------------------------------------

describe("World Capitals (collection.anki2)", () => {
  let collection: AnkiCollection;

  beforeAll(async () => {
    const buf = readFileSync(join(TEST_DIR, "World_Capitals", "collection.anki2"));
    collection = await readAnkiCollection(new Uint8Array(buf));
  });

  test("reads a valid collection", () => {
    expect(collection).toBeDefined();
  });

  test("contains the World Capitals deck", () => {
    const decks = collection.getDecks();
    const names = Object.values(decks).map((d) => d.getName());
    expect(names).toContain("World Capitals");
  });

  test("World Capitals deck has 194 cards", () => {
    const decks = collection.getDecks();
    const deck = Object.values(decks).find((d) => d.getName() === "World Capitals")!;
    expect(Object.keys(deck.getCards())).toHaveLength(194);
  });

  test("model has Etupuoli and Kääntöpuoli fields", () => {
    const models = collection.getModels();
    const model = Object.values(models)[0]!;
    const fieldNames = model.getFields().map((f) => f.name);
    expect(fieldNames).toContain("Etupuoli");
    expect(fieldNames).toContain("Kääntöpuoli");
  });

  test("United Arab Emirates card maps to Abu Dhabi", () => {
    const decks = collection.getDecks();
    const deck = Object.values(decks).find((d) => d.getName() === "World Capitals")!;
    const cards = deck.getCards();
    const uae = Object.values(cards).find(
      (c) => c.getFields().Etupuoli === "United Arab Emirates",
    )!;
    expect(uae).toBeDefined();
    expect(uae.getFields()["Kääntöpuoli"]).toBe("Abu Dhabi");
  });

  test("United Arab Emirates card question renders the country name", () => {
    const decks = collection.getDecks();
    const deck = Object.values(decks).find((d) => d.getName() === "World Capitals")!;
    const uae = Object.values(deck.getCards()).find(
      (c) => c.getFields().Etupuoli === "United Arab Emirates",
    )!;
    const questions = uae.getQuestions();
    expect(questions[0]!.getQuestionString()).toBe("United Arab Emirates");
  });

  test("United Arab Emirates card answer contains Abu Dhabi", () => {
    const decks = collection.getDecks();
    const deck = Object.values(decks).find((d) => d.getName() === "World Capitals")!;
    const uae = Object.values(deck.getCards()).find(
      (c) => c.getFields().Etupuoli === "United Arab Emirates",
    )!;
    const questions = uae.getQuestions();
    expect(questions[0]!.getAnswerString()).toContain("Abu Dhabi");
  });

  test("all cards have non-empty front and back fields", () => {
    const decks = collection.getDecks();
    const deck = Object.values(decks).find((d) => d.getName() === "World Capitals")!;
    const cards = Object.values(deck.getCards());
    for (const card of cards) {
      expect(card.getFront().trim()).not.toBe("");
      expect(card.getBack().trim()).not.toBe("");
    }
  });
});
