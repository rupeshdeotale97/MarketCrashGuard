'use server';
/**
 * @fileOverview AI flow to analyze financial statements (CSV/Text).
 * 
 * - analyzeStatement: Extracts portfolio allocation percentages from statement text.
 * 
 * Uses Genkit 1.x defineFlow pattern.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeStatementInputSchema = z.object({
  fileContent: z
    .string()
    .describe(
      "The raw text content extracted from a financial statement (CSV or exported text)."
    ),
});

const AnalyzeStatementOutputSchema = z.object({
  equity: z.number().describe('Percentage allocated to Equities (0-100).'),
  debt: z.number().describe('Percentage allocated to Debt/Bonds (0-100).'),
  crypto: z.number().describe('Percentage allocated to Crypto Assets (0-100).'),
  cash: z.number().describe('Percentage allocated to Cash/Liquidity (0-100).'),
  confidence: z.number().describe('Confidence score of the extraction (0-1).'),
});

export type AnalyzeStatementOutput = z.infer<typeof AnalyzeStatementOutputSchema>;

const analyzeStatementFlow = ai.defineFlow(
  {
    name: 'analyzeStatementFlow',
    inputSchema: AnalyzeStatementInputSchema,
    outputSchema: AnalyzeStatementOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      output: { schema: AnalyzeStatementOutputSchema },
      prompt: `You are a professional financial data analyst. Your goal is to extract asset allocation percentages from the provided CSV or text statement data.
      
      Analyze the text content for:
      - Equity/Stocks/Mutual Funds (Equity)
      - Debt/Bonds/Fixed Income (Debt)
      - Cryptocurrency/Digital Assets (Crypto)
      - Cash/Bank Balance/Liquidity (Cash)
      
      Guidelines:
      1. Map the detected assets to the closest category above.
      2. Ensure the total of percentages is exactly 100%.
      3. If specific percentages are not explicitly stated, estimate them based on the market value of each line item.
      4. Disregard any non-portfolio related transactions.
      
      Statement Data:
      {{{fileContent}}}`,
      input: { fileContent: input.fileContent },
    });

    if (!output) throw new Error('Failed to parse statement content.');
    return output;
  }
);

export async function analyzeStatement(fileContent: string): Promise<AnalyzeStatementOutput> {
  return analyzeStatementFlow({ fileContent });
}
