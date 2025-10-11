import fs from "fs/promises";
// @ts-ignore
import pdf from "pdf-parse";

import mammoth from "mammoth";

export const extractTextFromFile = async (filePath: string): Promise<string> => {
  const ext = filePath.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    const buffer = await fs.readFile(filePath);
    const data = await pdf(buffer);
    return data.text;
  }

  if (ext === "docx") {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type");
};
