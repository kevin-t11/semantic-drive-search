import { Request, Response } from "express";
import {
  getTextFilesFromDrive,
  getFileContentFromDrive,
} from "../services/drive";
import { asyncHandler } from "../utils/asyncHandler";

export const getTextFiles = asyncHandler(
  async (req: Request, res: Response) => {
    const files = await getTextFilesFromDrive(req.tokens!);

    res.json({
      status: "success",
      data: { files },
    });
  }
);

export const getFileContent = asyncHandler(
  async (req: Request, res: Response) => {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        status: "error",
        message: "File ID is required",
      });
    }

    const content = await getFileContentFromDrive(req.tokens!, fileId);

    res.json({
      status: "success",
      data: { content },
    });
  }
);
