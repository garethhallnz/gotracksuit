import type { Database } from "@db/sqlite";
import type { Insight, NewInsight } from "@suittracker/lib/schemas/insight";
import { log } from "../log.ts";
import * as insightsTable from "../tables/insights.ts";

export const createInsight = (db: Database, insight: NewInsight): Insight => {
  log.debug(`Creating insight for brand=${insight.brand}`);

  const createdAt = new Date();

  const [row] = db.sql<insightsTable.Row>`
    INSERT INTO insights (brand, createdAt, text)
    VALUES (${insight.brand}, ${createdAt.toISOString()}, ${insight.text})
    RETURNING *
  `;

  const result = insightsTable.toInsight(row);
  log.info(`Created insight id=${result.id}`);
  return result;
};
