import type { Insight } from "@suittracker/lib/schemas/insight";
import type { HasDBClient } from "../shared.ts";
import * as insightsTable from "$tables/insights.ts";

type Input = HasDBClient & {
  id: number;
};

export default (input: Input): Insight | undefined => {
  console.log(`Looking up insight for id=${input.id}`);

  const [row] = input.db
    .sql<
    insightsTable.Row
  >`SELECT * FROM insights WHERE id = ${input.id} LIMIT 1`;

  if (row) {
    const result = insightsTable.toInsight(row);
    console.log("Insight retrieved:", result);
    return result;
  }

  console.log("Insight not found");
  return;
};
