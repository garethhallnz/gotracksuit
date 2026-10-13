import type { Insight, NewInsight } from "$models/insight.ts";
import type { HasDBClient } from "../shared.ts";
import type * as insightsTable from "$tables/insights.ts";

type Input = HasDBClient & NewInsight;

export default (input: Input): Insight => {
  console.log(`Creating insight for brand=${input.brand}`);

  const createdAt = new Date();

  const [row] = input.db.sql<insightsTable.Row>`
    INSERT INTO insights (brand, createdAt, text)
    VALUES (${input.brand}, ${createdAt.toISOString()}, ${input.text})
    RETURNING *
  `;

  const result = { ...row, createdAt: new Date(row.createdAt) };
  console.log("Insight created:", result);
  return result;
};
