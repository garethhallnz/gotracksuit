import type { Insight } from "@suittracker/lib/schemas/insight";
import type { HasDBClient } from "../shared.ts";
import * as insightsTable from "$tables/insights.ts";

type Input = HasDBClient;

export default (input: Input): Insight[] => {
  console.log("Listing insights");

  const rows = input.db.sql<insightsTable.Row>`SELECT * FROM insights`;

  const result = rows.map(insightsTable.toInsight);

  console.log("Retrieved insights successfully: ", result);
  return result;
};
