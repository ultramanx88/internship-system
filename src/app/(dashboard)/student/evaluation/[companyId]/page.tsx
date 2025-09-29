'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { companyEvaluations } from '@/lib/data';
import type { CompanyEvaluationQuestion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function EvaluationFormPage({ params }: { params: { companyId: string } }) {
  const { companyId } = params;
  const { toast } = useToast();
  const router = useRouter();

  const [evaluation, setEvaluation] = useState(companyEvaluations.find(e => e.internshipId === companyId));
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (evaluation) {
      const initialScores: Record<string, number | null> = {};
      evaluation.questions.forEach(q => {
        initialScores[q.id] = q.score;
      });
      setScores(initialScores);
    }
  }, [evaluation]);

  if (!evaluation) {
    notFound();
  }

  const handleScoreChange = (questionId: string, value: number) => {
    setScores(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
        console.log("Submitting Evaluation:", {
            companyId,
            scores,
            comment
        });

        // Update mock data
        const evalIndex = companyEvaluations.findIndex(e => e.internshipId === companyId);
        if (evalIndex !== -1) {
            companyEvaluations[evalIndex].isEvaluated = true;
            companyEvaluations[evalIndex].evaluationDate = new Date().toISOString();
            companyEvaluations[evalIndex].questions.forEach(q => {
                q.score = scores[q.id] ?? null;
            });
        }
        
        setIsSubmitting(false);
        toast({
            title: "ส่งแบบประเมินสำเร็จ",
            description: `ขอบคุณสำหรับความคิดเห็นของคุณเกี่ยวกับ ${evaluation.companyName}`,
        });
        router.push('/student/evaluation');
    }, 1000);
  };
  
  const isFormComplete = Object.values(scores).every(score => score !== null && score > 0);


  return (
    <div className="grid gap-8 text-secondary-600">
       <div>
         <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/student/evaluation">
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับไปหน้ารายการ
            </Link>
        </Button>
        <h1 className="text-3xl font-bold gradient-text">แบบประเมินสถานประกอบการ</h1>
        <p>ประเมิน: <span className="font-semibold">{evaluation.companyName}</span></p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>หัวข้อการประเมิน</CardTitle>
            <CardDescription>
              โปรดให้คะแนนในแต่ละหัวข้อต่อไปนี้ (1 = น้อยที่สุด, 5 = มากที่สุด)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {evaluation.questions.map((q, index) => (
              <div key={q.id} className="space-y-3">
                <Label htmlFor={`q-${q.id}`} className="text-base">
                  {index + 1}. {q.question}
                </Label>
                <div className="flex items-center gap-4">
                    <Slider
                        id={`q-${q.id}`}
                        min={1}
                        max={5}
                        step={1}
                        value={[scores[q.id] || 0]}
                        onValueChange={(value) => handleScoreChange(q.id, value[0])}
                        className="w-full max-w-sm"
                        disabled={isSubmitting}
                    />
                    <span className="font-bold text-lg w-8 text-center">{scores[q.id] || '-'}</span>
                </div>
              </div>
            ))}
            
            <div className="space-y-2">
                <Label htmlFor="comment" className="text-base">
                    ข้อเสนอแนะเพิ่มเติม
                </Label>
                <Textarea
                    id="comment"
                    placeholder="คุณมีข้อเสนอแนะอะไรเพิ่มเติมเกี่ยวกับสถานประกอบการนี้หรือไม่?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                />
            </div>

             <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !isFormComplete}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกและส่งแบบประเมิน'}
                </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
