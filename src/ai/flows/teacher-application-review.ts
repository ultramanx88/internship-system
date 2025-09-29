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
  studentName: z.string().describe('ชื่อของนักเรียนที่สมัคร'),
  studentSkills: z.string().describe('รายการทักษะที่นักเรียนมี'),
  studentStatement: z.string().describe('เรียงความแสดงจุดประสงค์ของนักเรียนในการฝึกงาน'),
  internshipDescription: z.string().describe('คำอธิบายตำแหน่งงานฝึกงาน'),
});
export type ReviewApplicationInput = z.infer<typeof ReviewApplicationInputSchema>;

const ReviewApplicationOutputSchema = z.object({
  recommendation: z.enum(['approve', 'reject']).describe('คำแนะนำสำหรับใบสมัคร'),
  reason: z.string().describe('เหตุผลโดยละเอียดเบื้องหลังคำแนะนำ'),
});
export type ReviewApplicationOutput = z.infer<typeof ReviewApplicationOutputSchema>;

export async function reviewApplication(input: ReviewApplicationInput): Promise<ReviewApplicationOutput> {
  return reviewApplicationFlow(input);
}

const reviewApplicationPrompt = ai.definePrompt({
  name: 'reviewApplicationPrompt',
  input: {schema: ReviewApplicationInputSchema},
  output: {schema: ReviewApplicationOutputSchema},
  prompt: `คุณเป็นอาจารย์ผู้มีประสบการณ์ในการตรวจสอบใบสมัครฝึกงาน จากทักษะของนักเรียน, เรียงความ, และคำอธิบายการฝึกงาน, โปรดให้คำแนะนำว่าจะอนุมัติหรือปฏิเสธใบสมัคร อธิบายเหตุผลของคุณโดยละเอียด

ชื่อนักเรียน: {{{studentName}}}
ทักษะของนักเรียน: {{{studentSkills}}}
เรียงความของนักเรียน: {{{studentStatement}}}
คำอธิบายการฝึกงาน: {{{internshipDescription}}}

พิจารณาว่าทักษะและประสบการณ์ของนักเรียนสอดคล้องกับข้อกำหนดของการฝึกงานหรือไม่ และคุณภาพและความจริงใจของเรียงความของนักเรียน`,
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
