import type { Insight, NewInsight } from "@suittracker/lib/schemas/insight";
import type { HasDBClient } from "../shared.ts";
import * as insightsTable from "$tables/insights.ts";
import { log } from "../log.ts";

type Input = HasDBClient & NewInsight;

export default (input: Input): Insight => {
  log.debug(`Creating insight for brand=${input.brand}`);

  const createdAt = new Date();

  const [row] = input.db.sql<insightsTable.Row>`
    INSERT INTO insights (brand, createdAt, text)
    VALUES (${input.brand}, ${createdAt.toISOString()}, ${input.text})
    RETURNING *
  `;

  const result = insightsTable.toInsight(row);
  log.info(`Created insight id=${result.id}`);
  return result;
};
