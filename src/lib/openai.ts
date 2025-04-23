// i want to use this, but for some reason, openAI is throwing 500s at me when calling it
//import OpenAI from "openai";
//import { zodTextFormat } from "openai/helpers/zod";
//import { PuzzleResponseSchema } from "./types";
//
//export async function generateCodePuzzle(prompt: string, apiKey: string) {
//  const openai = new OpenAI({
//    apiKey,
//  });
//
//  const systemPrompt = `
//    You are a code puzzle generator. Your task is to:
//    1.  Analyze the user's programming task description.
//    2.  Generate a correct Python code solution for the task.
//    3.  Break the solution down into logical, individual code blocks (usually one line per block, but can be multiple for constructs like loops or conditionals if necessary).
//    4.  For each block, provide:
//        - A unique string ID.
//        - The code itself.
//        - A concise explanation of the code's purpose and why it's needed in the solution.
//        - The correct 0-based indentation level.
//        - The correct 1-based line number in the final solution sequence.
//    5.  Create two arrays:
//        - 'solution': Contains the code blocks in the correct sequential order.
//        - 'blocks': Contains the *same* code blocks but randomly shuffled.
//    6.  Format your entire output according to the provided schema.
//  `;
//
//  try {
//    console.log("send openai request");
//
//    const response = await openai.responses.parse({
//      model: "gpt-4.1-mini",
//      input: [
//        { role: "system", content: systemPrompt },
//        {
//          role: "user",
//          content: `Generate a code puzzle for this task: ${prompt}`,
//        },
//      ],
//      text: {
//        format: zodTextFormat(PuzzleResponseSchema, "puzzle"),
//      },
//    });
//
//    const puzzleData = response.output_parsed;
//
//    return puzzleData;
//  } catch (error) {
//    console.error("Error calling OpenAI responses.parse:", error);
//  }
//}
//
//

import { CodeBlock } from "./types";
import OpenAI from "openai";

export async function generateCodePuzzle(
  prompt: string,
  apiKey: string,
): Promise<{
  blocks: CodeBlock[];
  solution: CodeBlock[];
}> {
  const openai = new OpenAI({
    apiKey,
  });

  const systemPrompt = `
    You are a code puzzle generator. Generate a programming solution for the given task, 
    and then create a puzzle by breaking the solution into individual code blocks.
    
    For each block, provide:
    1. The code for that block
    2. An explanation of what that line does
    3. The correct indentation level (0 for no indentation, 1 for one level, etc.)
    4. The correct line number in the solution
    
    Return the response as a JSON object with two arrays:
    1. "blocks": An array of shuffled code blocks
    2. "solution": An array of code blocks in the correct order
    
    Each code block should have these properties:
    - id: A unique string identifier
    - code: The code string
    - explanation: A brief explanation of what this code does
    - indentation: The indentation level (integer)
    - lineNumber: The line number in the correct solution (integer)
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    let parsedContent;

    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      console.error("error parsing json", error);
      throw error;
    }

    return {
      blocks: parsedContent.blocks,
      solution: parsedContent.solution,
    };
  } catch (error) {
    console.error("error calling openai api", error);
    throw error;
  }
}
