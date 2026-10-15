import type { Database } from "@db/sqlite";
import type { Insight } from "@suittracker/lib/schemas/insight";
import { log } from "../log.ts";
import * as insightsTable from "$tables/insights.ts";

export const listInsights = (db: Database): Insight[] => {
  log.debug("Listing insights");

  const rows = db.sql<insightsTable.Row>`
    SELECT * FROM insights ORDER BY createdAt DESC, id DESC
  `;

  const result = rows.map(insightsTable.toInsight);

  log.debug(`Listed ${result.length} insights`);
  return result;
};
