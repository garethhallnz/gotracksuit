import type { Database } from "@db/sqlite";
import { log } from "../log.ts";

export const deleteInsight = (db: Database, id: number): boolean => {
  log.debug(`Deleting insight id=${id}`);

  const changes = db.exec("DELETE FROM insights WHERE id = ?", id);

  if (changes > 0) {
    log.info(`Deleted insight id=${id}`);
    return true;
  }

  log.debug(`No insight to delete for id=${id}`);
  return false;
};
