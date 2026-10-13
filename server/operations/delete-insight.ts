import type { HasDBClient } from "../shared.ts";

type Input = HasDBClient & {
  id: number;
};

export default (input: Input): boolean => {
  console.log(`Deleting insight for id=${input.id}`);

  const changes = input.db.exec("DELETE FROM insights WHERE id = ?", input.id);

  if (changes > 0) {
    console.log("Insight deleted");
    return true;
  }

  console.log("Insight not found");
  return false;
};
