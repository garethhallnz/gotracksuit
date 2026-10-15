import { Database } from "@db/sqlite";
import * as path from "@std/path";
import { readServerPort } from "@suittracker/lib";
import { createApp } from "./app.ts";
import * as insightsTable from "./tables/insights.ts";
import { log } from "./log.ts";

log.info("Loading configuration");

const env = {
  port: readServerPort(),
};

const dbFilePath = path.resolve("tmp", "db.sqlite3");

log.info(`Opening SQLite database at ${dbFilePath}`);

await Deno.mkdir(path.dirname(dbFilePath), { recursive: true });
const db = new Database(dbFilePath);
db.exec(insightsTable.createTable);

log.info("Initialising server");

const app = createApp(db);
app.listen(env);
log.info(`Started server on port ${env.port}`);
