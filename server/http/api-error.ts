export type ApiError = {
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
