'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit instance for AI operations.
 * Initialized with Google AI plugin.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
