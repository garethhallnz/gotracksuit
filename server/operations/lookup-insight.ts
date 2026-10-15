import type { Database } from "@db/sqlite";
import type { Insight } from "@suittracker/lib/schemas/insight";
import { log } from "../log.ts";
import * as insightsTable from "$tables/insights.ts";

export const lookupInsight = (
  db: Database,
  id: number,
): Insight | undefined => {
  log.debug(`Looking up insight id=${id}`);

  const [row] = db.sql<insightsTable.Row>`
    SELECT * FROM insights WHERE id = ${id} LIMIT 1
  `;

  if (row) {
    const result = insightsTable.toInsight(row);
    log.debug(`Found insight id=${id}`);
    return result;
  }

  log.debug(`No insight found for id=${id}`);
  return;
};
