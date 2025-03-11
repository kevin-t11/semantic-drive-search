import { Request, Response, NextFunction } from "express";

// A utility that wraps asynchronous functions to handle errors and avoid repetitive try/catch blocks.
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
