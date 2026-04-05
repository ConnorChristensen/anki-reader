import initSqlJs from "sql.js";
import { AnkiCollection } from "./classes/AnkiCollection";
import { Card } from "./classes/Card";
import { Deck } from "./classes/Deck";
import { Model } from "./classes/Model";
import * as zip from "@zip.js/zip.js";

export type { AnkiCollection, Card, Deck, Model };

interface IOptions {
  sqlConfig?: Partial<EmscriptenModule>;
}

interface IExtractedAnkiPackage {
  collection: AnkiCollection;
  media: Record<string, Blob>;
}

export async function readAnkiCollection(
  ankiCollection: Uint8Array,
  options?: IOptions,
): Promise<AnkiCollection> {
  const collection = await initSqlJs(options?.sqlConfig)
    .then((SQL) => {
      const db = new SQL.Database(new Uint8Array(ankiCollection));

      return new AnkiCollection(db);
    })
    .catch((error) => {
      console.error("Error loading SQLite database:", error);
      throw new Error("Error loading SQLite database");
    });
  return collection;
}

export async function readFromUrl(url: string, options?: IOptions): Promise<AnkiCollection> {
  const collection = await fetch(url)
    .then(async (response) => await response.arrayBuffer())
    .then(async (arrayBuffer) => {
      return await readAnkiCollection(new Uint8Array(arrayBuffer), options);
    })
    .catch((error) => {
      console.error("Error loading SQLite database:", error);
      throw new Error("Error loading SQLite database");
    });

  return collection;
}

function isFileEntry(entry: zip.Entry): entry is zip.FileEntry {
  return entry.directory === false;
}

async function readMedia(entries: zip.Entry[]): Promise<Record<string, Blob>> {
  const media: Record<string, Blob> = {};
  const mediaMap = entries.find((entry) => entry.filename === "media");
  if (mediaMap == null || !isFileEntry(mediaMap)) {
    console.warn("Could not find media map in Anki package");
    return media;
  }

  try {
    const mediaMapArrayBuffer = await mediaMap.getData(new zip.Uint8ArrayWriter());
    const mediaMapString = new TextDecoder("utf-8").decode(new Uint8Array(mediaMapArrayBuffer));
    const mediaMapJson = JSON.parse(mediaMapString);
    for (const [key, value] of Object.entries(mediaMapJson)) {
      const mediaEntry = entries.find((entry) => entry.filename === key);
      if (mediaEntry == null || !isFileEntry(mediaEntry)) {
        continue;
      }

      const mediaArrayBuffer = await mediaEntry.getData(new zip.Uint8ArrayWriter());
      // default to original key if value is invalid
      media[value?.toString() ?? key] = new Blob([new Uint8Array(mediaArrayBuffer)]);
    }
  } catch (error) {
    console.error("Error parsing media map:", error);
    return media;
  }

  return media;
}

export async function readAnkiPackage(
  ankiPackage: Blob,
  options?: IOptions,
): Promise<IExtractedAnkiPackage> {
  const reader = new zip.ZipReader(new zip.BlobReader(ankiPackage));
  return await reader.getEntries().then(async (entries) => {
    const collectionEntry = entries.find((entry) => entry.filename === "collection.anki2");
    if (collectionEntry == null || !isFileEntry(collectionEntry)) {
      throw new Error("Could not find collection.anki2 in Anki package");
    }

    const collectionArrayBuffer = await collectionEntry.getData(new zip.Uint8ArrayWriter());
    const collection = await readAnkiCollection(new Uint8Array(collectionArrayBuffer), options);
    const media = await readMedia(entries);

    return {
      collection,
      media,
    };
  });
}

export async function readAnkiPackageFromUrl(
  url: string,
  options?: IOptions,
): Promise<IExtractedAnkiPackage> {
  const reader = new zip.ZipReader(new zip.HttpReader(url));
  return await reader.getEntries().then(async (entries) => {
    const collectionEntry = entries.find((entry) => entry.filename === "collection.anki2");
    if (collectionEntry == null || !isFileEntry(collectionEntry)) {
      throw new Error("Could not find collection.anki2 in Anki package");
    }

    const collectionArrayBuffer = await collectionEntry.getData(new zip.Uint8ArrayWriter());
    const collection = await readAnkiCollection(new Uint8Array(collectionArrayBuffer), options);
    const media = await readMedia(entries);

    return {
      collection,
      media,
    };
  });
}
