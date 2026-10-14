import type { Insight } from "@suittracker/lib/schemas/insight";
import type { HasDBClient } from "../shared.ts";
import * as insightsTable from "$tables/insights.ts";
import { log } from "../log.ts";

type Input = HasDBClient;

export default (input: Input): Insight[] => {
  log.debug("Listing insights");

  const rows = input.db.sql<insightsTable.Row>`
    SELECT * FROM insights ORDER BY createdAt DESC, id DESC
  `;

  const result = rows.map(insightsTable.toInsight);

  log.debug(`Listed ${result.length} insights`);
  return result;
};
