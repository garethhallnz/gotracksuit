import type { Insight } from "@suittracker/lib/schemas/insight";

export const createTable = `
  CREATE TABLE IF NOT EXISTS insights (
    id INTEGER PRIMARY KEY ASC NOT NULL,
    brand INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    text TEXT NOT NULL
  )
`;

export type Row = {
  id: number;
  brand: number;
  createdAt: string;
  text: string;
};

export type Insert = {
  brand: number;
  createdAt: string;
  text: string;
};

export const toInsight = (row: Row): Insight => ({
  id: row.id,
  brand: row.brand,
  createdAt: new Date(row.createdAt),
  text: row.text,
});
