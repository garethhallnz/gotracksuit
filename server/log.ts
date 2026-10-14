const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;

type Level = keyof typeof LEVELS;

const isLevel = (value: string | undefined): value is Level =>
  value !== undefined && value in LEVELS;

const configuredLevel = Deno.env.get("LOG_LEVEL");
const threshold = LEVELS[isLevel(configuredLevel) ? configuredLevel : "info"];

const write = (level: Level, message: string) => {
  if (LEVELS[level] < threshold) return;

  const line = `${new Date().toISOString()} ${level.toUpperCase()} ${message}`;
  // deno-lint-ignore no-console
  const output = LEVELS[level] >= LEVELS.warn ? console.error : console.log;
  output(line);
};

export const log = {
  debug: (message: string) => write("debug", message),
  info: (message: string) => write("info", message),
  warn: (message: string) => write("warn", message),
  error: (message: string) => write("error", message),
};
