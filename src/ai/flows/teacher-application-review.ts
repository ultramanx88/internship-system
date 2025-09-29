'use server';

/**
 * @fileOverview An AI-powered tool for teachers to review student internship applications.
 *
 * - reviewApplication - A function that reviews a student's internship application and provides a recommendation.
 * - ReviewApplicationInput - The input type for the reviewApplication function.
 * - ReviewApplicationOutput - The return type for the reviewApplication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewApplicationInputSchema = z.object({
  studentName: z.string().describe('The name of the student applying.'),
  studentSkills: z.string().describe('A list of skills the student possesses.'),
  studentStatement: z.string().describe('The student statement of purpose for the internship.'),
  internshipDescription: z.string().describe('The description of the internship position.'),
});
export type ReviewApplicationInput = z.infer<typeof ReviewApplicationInputSchema>;

const ReviewApplicationOutputSchema = z.object({
  recommendation: z.enum(['approve', 'reject']).describe('The recommendation for the application.'),
  reason: z.string().describe('The detailed reasoning behind the recommendation.'),
});
export type ReviewApplicationOutput = z.infer<typeof ReviewApplicationOutputSchema>;

export async function reviewApplication(input: ReviewApplicationInput): Promise<ReviewApplicationOutput> {
  return reviewApplicationFlow(input);
}

const reviewApplicationPrompt = ai.definePrompt({
  name: 'reviewApplicationPrompt',
  input: {schema: ReviewApplicationInputSchema},
  output: {schema: ReviewApplicationOutputSchema},
  prompt: `You are a seasoned teacher reviewing internship applications. Based on the student's skills, statement, and the internship description, provide a recommendation to either approve or reject the application. Explain your reasoning in detail.

Student Name: {{{studentName}}}
Student Skills: {{{studentSkills}}}
Student Statement: {{{studentStatement}}}
Internship Description: {{{internshipDescription}}}

Consider whether the student's skills and experience align with the internship requirements, and the quality and sincerity of the student's statement.`, // Changed template string to backticks
});

const reviewApplicationFlow = ai.defineFlow(
  {
    name: 'reviewApplicationFlow',
    inputSchema: ReviewApplicationInputSchema,
    outputSchema: ReviewApplicationOutputSchema,
  },
  async input => {
    const {output} = await reviewApplicationPrompt(input);
    return output!;
  }
);
