// i want to use this, but for some reason, openAI is throwing 500s at me when using this method
//import { z } from "zod";
//
//export const CodeBlockSchema = z.object({
//  id: z.string().describe("A unique string identifier for the block"),
//  code: z.string().describe("The code string for this block"),
//  explanation: z
//    .string()
//    .describe("A brief explanation of what this code does and why it's needed"),
//  indentation: z
//    .number()
//    .int()
//    .describe(
//      "The indentation level (0 for no indentation, 1 for one level, etc.)",
//    ),
//  lineNumber: z
//    .number()
//    .int()
//    .describe("The original line number in the correct solution"),
//});
//
//export const PuzzleResponseSchema = z.object({
//  blocks: z
//    .array(CodeBlockSchema)
//    .describe("An array of shuffled code blocks for the puzzle"),
//  solution: z
//    .array(CodeBlockSchema)
//    .describe(
//      "An array of code blocks in the shuffled order, representing the solution",
//    ),
//});
//
//

export interface CodeBlock {
  id: string;
  code: string;
  explanation: string;
  indentation: number;
  lineNumber: number;
}
