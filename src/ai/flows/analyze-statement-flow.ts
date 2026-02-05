'use server';
/**
 * @fileOverview AI flow to analyze financial statements (CAS).
 * 
 * - analyzeStatement: Extracts portfolio allocation percentages from a statement image.
 * 
 * Uses Genkit 1.x defineFlow pattern.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeStatementInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a financial statement (CAS), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
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
      prompt: `You are a professional financial statement analyzer. Your goal is to extract asset allocation percentages from the provided image (Consolidated Account Statement or CAS).
      
      Look for:
      - Equity/Stocks/Mutual Funds (Equity)
      - Debt/Bonds/Fixed Income (Debt)
      - Cryptocurrency/Digital Assets (Crypto)
      - Cash/Bank Balance/Liquidity (Cash)
      
      If specific labels aren't found, map the values to the closest category. 
      Ensure the total is exactly 100%. If you can't find specific percentages, estimate based on the portfolio value distribution shown in the image.
      
      Context: {{media url=photoDataUri}}`,
      input: { photoDataUri: input.photoDataUri },
    });

    if (!output) throw new Error('Failed to parse statement.');
    return output;
  }
);

export async function analyzeStatement(photoDataUri: string): Promise<AnalyzeStatementOutput> {
  return analyzeStatementFlow({ photoDataUri });
}
