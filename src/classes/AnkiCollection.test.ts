import { describe, test, expect } from "bun:test";
import { AnkiCollection } from "./AnkiCollection";
import { Deck } from "./Deck";
import { Model } from "./Model";

const makeDb = (queryResults: Record<string, any[][]>) =>
  ({
    exec: (sql: string) => {
      const match = sql.match(/SELECT (\w+) FROM col/);
      if (!match) return [];
      const values = queryResults[match[1]!];
      if (!values) return [];
      return [{ columns: [match[1]], values }];
    },
  }) as any;

describe("AnkiCollection", () => {
  test("getDecks returns Deck instances keyed by id", () => {
    const deckJson = { "1": { name: "Default", desc: "", id: "1" } };
    const db = makeDb({ decks: [[JSON.stringify(deckJson)]] });
    const collection = new AnkiCollection(db);
    const decks = collection.getDecks();
    expect(Object.keys(decks)).toHaveLength(1);
    expect(decks["1"]).toBeInstanceOf(Deck);
    expect(decks["1"]!.getName()).toBe("Default");
  });

  test("getDecks returns empty object when query has no results", () => {
    const collection = new AnkiCollection(makeDb({}));
    expect(collection.getDecks()).toEqual({});
  });

  test("getDecks caches result and only queries the db once", () => {
    let calls = 0;
    const db = {
      exec: () => {
        calls++;
        return [{ columns: ["decks"], values: [['{"1":{"name":"Default","id":"1","desc":""}}']] }];
      },
    } as any;
    const collection = new AnkiCollection(db);
    collection.getDecks();
    collection.getDecks();
    expect(calls).toBe(1);
  });

  test("getModels returns Model instances keyed by id", () => {
    const modelJson = {
      "123": { name: "Basic", css: "", type: 0, flds: [], tmpls: [], latexPre: "", latexPost: "" },
    };
    const db = makeDb({ models: [[JSON.stringify(modelJson)]] });
    const collection = new AnkiCollection(db);
    const models = collection.getModels();
    expect(models["123"]).toBeInstanceOf(Model);
    expect(models["123"]!.getName()).toBe("Basic");
  });

  test("getModels returns empty object when query has no results", () => {
    const collection = new AnkiCollection(makeDb({}));
    expect(collection.getModels()).toEqual({});
  });

  test("getCreationTime multiplies timestamp by 1000 (seconds → ms)", () => {
    const seconds = 1609459200;
    const collection = new AnkiCollection(makeDb({ crt: [[seconds]] }));
    expect(collection.getCreationTime().getTime()).toBe(seconds * 1000);
  });

  test("getModificationTime uses timestamp as-is (already ms)", () => {
    const ms = 1609459200000;
    const collection = new AnkiCollection(makeDb({ mod: [[ms]] }));
    expect(collection.getModificationTime().getTime()).toBe(ms);
  });

  test("getSchemaModificationTime uses timestamp as-is", () => {
    const ms = 1700000000000;
    const collection = new AnkiCollection(makeDb({ scm: [[ms]] }));
    expect(collection.getSchemaModificationTime().getTime()).toBe(ms);
  });

  test("getVersion returns version number", () => {
    const collection = new AnkiCollection(makeDb({ ver: [[11]] }));
    expect(collection.getVersion()).toBe(11);
  });

  test("getVersion returns 0 when query has no results", () => {
    const collection = new AnkiCollection(makeDb({}));
    expect(collection.getVersion()).toBe(0);
  });

  test("getConfig parses and returns the config JSON", () => {
    const config = { activeDecks: [1], curDeck: 1 };
    const collection = new AnkiCollection(makeDb({ conf: [[JSON.stringify(config)]] }));
    expect(collection.getConfig()).toEqual(config);
  });

  test("getConfig returns a new copy each call", () => {
    const config = { activeDecks: [1] };
    const collection = new AnkiCollection(makeDb({ conf: [[JSON.stringify(config)]] }));
    expect(collection.getConfig()).not.toBe(collection.getConfig());
    expect(collection.getConfig()).toEqual(collection.getConfig());
  });

  test("getDconf parses and returns the dconf JSON", () => {
    const dconf = { "1": { name: "Default", maxTaken: 60 } };
    const collection = new AnkiCollection(makeDb({ dconf: [[JSON.stringify(dconf)]] }));
    expect(collection.getDconf()).toEqual(dconf);
  });

  test("getTags parses and returns the tags JSON", () => {
    const tags = { tag1: 0, tag2: 0 };
    const collection = new AnkiCollection(makeDb({ tags: [[JSON.stringify(tags)]] }));
    expect(collection.getTags()).toEqual(tags);
  });

  test("getRawCollection returns the underlying database", () => {
    const db = makeDb({});
    const collection = new AnkiCollection(db);
    expect(collection.getRawCollection()).toBe(db);
  });
});
