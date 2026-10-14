import type { HasDBClient } from "../shared.ts";
import { log } from "../log.ts";

type Input = HasDBClient & {
  id: number;
};

export default (input: Input): boolean => {
  log.debug(`Deleting insight id=${input.id}`);

  const changes = input.db.exec("DELETE FROM insights WHERE id = ?", input.id);

  if (changes > 0) {
    log.info(`Deleted insight id=${input.id}`);
    return true;
  }

  log.debug(`No insight to delete for id=${input.id}`);
  return false;
};
