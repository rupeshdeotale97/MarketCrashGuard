'use server';
/**
 * @fileOverview An AI agent that provides detailed explanations for suggested actions based on market conditions.
 *
 * - explainSuggestedActions - A function that provides detailed explanations for suggested actions.
 * - ExplainSuggestedActionsInput - The input type for the explainSuggestedActions function.
 * - ExplainSuggestedActionsOutput - The return type for the explainSuggestedActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainSuggestedActionsInputSchema = z.object({
  marketRiskFactors: z.string().describe('The current market risk factors.'),
  suggestedActions: z.array(z.string()).describe('The list of suggested actions.'),
});
export type ExplainSuggestedActionsInput = z.infer<typeof ExplainSuggestedActionsInputSchema>;

const ExplainSuggestedActionsOutputSchema = z.object({
  detailedExplanations: z.array(z.string()).describe('Detailed explanations for each suggested action based on the market conditions.'),
});
export type ExplainSuggestedActionsOutput = z.infer<typeof ExplainSuggestedActionsOutputSchema>;

export async function explainSuggestedActions(input: ExplainSuggestedActionsInput): Promise<ExplainSuggestedActionsOutput> {
  return explainSuggestedActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainSuggestedActionsPrompt',
  input: {schema: ExplainSuggestedActionsInputSchema},
  output: {schema: ExplainSuggestedActionsOutputSchema},
  prompt: `You are an expert financial advisor providing detailed explanations for suggested actions based on the current market conditions and risk indicators.

  Market Risk Factors: {{{marketRiskFactors}}}
  Suggested Actions: {{#each suggestedActions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Provide a detailed explanation for each suggested action, explaining why it is recommended given the current market risk factors. Focus on clarity, capital preservation, and risk awareness. Keep the explanations calm and non-emotional.

  Format your output as a JSON object with a "detailedExplanations" field, which is an array of strings, where each string is the detailed explanation for the corresponding suggested action. Make sure the response matches the output schema.`,
});

const explainSuggestedActionsFlow = ai.defineFlow(
  {
    name: 'explainSuggestedActionsFlow',
    inputSchema: ExplainSuggestedActionsInputSchema,
    outputSchema: ExplainSuggestedActionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
