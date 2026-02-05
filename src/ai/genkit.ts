
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit instance for AI operations.
 * Initialized with Google AI plugin.
 * This file contains the shared configuration for AI flows.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
