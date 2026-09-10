import { ZodError } from "zod";

export const validate = (schema) => async (req, res, next) => {
  try {
    const parsedData = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace request data with validated/sanitized data
    if (parsedData.body) req.body = parsedData.body;
    if (parsedData.query) req.query = parsedData.query;
    if (parsedData.params) req.params = parsedData.params;

    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Pass the zod error to the centralized error middleware
      return next(error);
    }
    return next(error);
  }
};
