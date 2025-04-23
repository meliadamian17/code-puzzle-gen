// lib/stubbed-response.ts
import { CodeBlock } from "./types";

export const stubbedResponse = {
  blocks: [
    {
      id: "1",
      code: "def memoized_fib(n, memo={}):",
      explanation:
        "Function definition with a memoization dictionary as default parameter",
      indentation: 0,
      lineNumber: 1,
    },
    {
      id: "2",
      code: "if n in memo:",
      explanation:
        "Check if the result is already cached in the memo dictionary",
      indentation: 1,
      lineNumber: 2,
    },
    {
      id: "3",
      code: "return memo[n]",
      explanation: "Return the cached result if found",
      indentation: 2,
      lineNumber: 3,
    },
    {
      id: "4",
      code: "if n <= 1:",
      explanation: "Base case for Fibonacci sequence",
      indentation: 1,
      lineNumber: 4,
    },
    {
      id: "5",
      code: "memo[n] = n",
      explanation: "Store base case result in memo",
      indentation: 2,
      lineNumber: 5,
    },
    {
      id: "6",
      code: "else:",
      explanation: "Handle recursive case",
      indentation: 1,
      lineNumber: 6,
    },
    {
      id: "7",
      code: "memo[n] = memoized_fib(n-1, memo) + memoized_fib(n-2, memo)",
      explanation: "Calculate Fibonacci number and store in memo",
      indentation: 2,
      lineNumber: 7,
    },
    {
      id: "8",
      code: "return memo[n]",
      explanation: "Return the calculated result",
      indentation: 1,
      lineNumber: 8,
    },
  ],
  solution: [
    {
      id: "1",
      code: "def memoized_fib(n, memo={}):",
      explanation:
        "Function definition with a memoization dictionary as default parameter",
      indentation: 0,
      lineNumber: 1,
    },
    {
      id: "2",
      code: "if n in memo:",
      explanation:
        "Check if the result is already cached in the memo dictionary",
      indentation: 1,
      lineNumber: 2,
    },
    {
      id: "3",
      code: "return memo[n]",
      explanation: "Return the cached result if found",
      indentation: 2,
      lineNumber: 3,
    },
    {
      id: "4",
      code: "if n <= 1:",
      explanation: "Base case for Fibonacci sequence",
      indentation: 1,
      lineNumber: 4,
    },
    {
      id: "5",
      code: "memo[n] = n",
      explanation: "Store base case result in memo",
      indentation: 2,
      lineNumber: 5,
    },
    {
      id: "6",
      code: "else:",
      explanation: "Handle recursive case",
      indentation: 1,
      lineNumber: 6,
    },
    {
      id: "7",
      code: "memo[n] = memoized_fib(n-1, memo) + memoized_fib(n-2, memo)",
      explanation: "Calculate Fibonacci number and store in memo",
      indentation: 2,
      lineNumber: 7,
    },
    {
      id: "8",
      code: "return memo[n]",
      explanation: "Return the calculated result",
      indentation: 1,
      lineNumber: 8,
    },
  ],
};

export function getShuffledResponse() {
  const shuffledBlocks = [...stubbedResponse.blocks].sort(
    () => Math.random() - 0.5,
  );

  return {
    blocks: shuffledBlocks,
    solution: stubbedResponse.solution,
  };
}
