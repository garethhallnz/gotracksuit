import type { Insight, NewInsight } from "@suittracker/lib/schemas/insight";
import type { HasDBClient } from "../shared.ts";
import * as insightsTable from "$tables/insights.ts";

type Input = HasDBClient & NewInsight;

export default (input: Input): Insight => {
  console.log(`Creating insight for brand=${input.brand}`);

  const createdAt = new Date();

  const [row] = input.db.sql<insightsTable.Row>`
    INSERT INTO insights (brand, createdAt, text)
    VALUES (${input.brand}, ${createdAt.toISOString()}, ${input.text})
    RETURNING *
  `;

  const result = insightsTable.toInsight(row);
  console.log("Insight created:", result);
  return result;
};
