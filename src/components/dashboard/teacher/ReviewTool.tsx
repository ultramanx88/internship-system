'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getAiRecommendation, updateApplicationStatus } from '@/lib/actions';
import { type User, type Internship, type Application, type ApplicationStatus } from '@/lib/types';
import { type ReviewApplicationOutput } from '@/ai/flows/teacher-application-review';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, X, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

type ReviewToolProps = {
  student: User;
  internship: Internship;
  application: Application;
};

export function ReviewTool({ student, internship, application }: ReviewToolProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendation, setRecommendation] = useState<ReviewApplicationOutput | null>(null);
  const [feedback, setFeedback] = useState('');

  const handleGetRecommendation = async () => {
    setIsLoadingAi(true);
    const result = await getAiRecommendation({
      studentName: student.name!,
      studentSkills: student.skills!,
      studentStatement: student.statement!,
      internshipDescription: internship.description,
    });
    setIsLoadingAi(false);

    if (result.success) {
      setRecommendation(result.data!);
    } else {
      toast({
        variant: 'destructive',
        title: 'การแนะนำจาก AI ล้มเหลว',
        description: result.message,
      });
    }
  };

  const handleDecision = async (status: ApplicationStatus) => {
    setIsSubmitting(true);
    const result = await updateApplicationStatus(application.id, status, feedback);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'ส่งการตัดสินใจแล้ว',
        description: `ใบสมัครถูก ${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}`,
      });
      router.push('/teacher');
      router.refresh();
    } else {
        toast({
            variant: 'destructive',
            title: 'การส่งล้มเหลว',
            description: result.message,
        });
    }
  };
  
  const isDecided = application.status !== 'pending';

  const recommendationTranslations: { [key: string]: string } = {
    approve: "อนุมัติ",
    reject: "ปฏิเสธ",
  };
  
  const badgeColors: { [key: string]: string } = {
    approve: "bg-[#2f7b69] text-white",
    reject: "bg-[#a01f38] text-white",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ตรวจสอบและตัดสินใจ</CardTitle>
        <CardDescription>ใช้เครื่องมือ AI เพื่อช่วยในกระบวนการตัดสินใจของคุณ</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Button onClick={handleGetRecommendation} disabled={isLoadingAi || !!recommendation || isDecided}>
            {isLoadingAi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoadingAi ? 'กำลังวิเคราะห์...' : 'รับคำแนะนำจาก AI'}
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {recommendation && (
           <Alert variant={recommendation.recommendation === 'approve' ? 'default' : 'destructive'} className={recommendation.recommendation === 'approve' ? 'border-green-200' : ''}>
             <AlertTitle className="flex items-center gap-2">
                {recommendation.recommendation === 'approve' ? <Check className="h-5 w-5 text-green-600"/> : <X className="h-5 w-5"/>}
                คำแนะนำจาก AI: <Badge className={`capitalize ${badgeColors[recommendation.recommendation]}`}>{recommendationTranslations[recommendation.recommendation]}</Badge>
            </AlertTitle>
            <AlertDescription className="mt-2 pl-7">
                <strong>เหตุผล:</strong> {recommendation.reason}
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        <div className="space-y-4">
            <h3 className="font-semibold">การตัดสินใจสุดท้าย</h3>
             <div className="space-y-2">
                <label htmlFor="feedback" className="text-sm font-medium">ความคิดเห็น (ไม่บังคับ)</label>
                <Textarea 
                    id="feedback"
                    placeholder="ให้ความคิดเห็นสำหรับนักเรียน..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={isSubmitting || isDecided}
                />
            </div>
            <div className="flex gap-4">
                <Button onClick={() => handleDecision('approved')} disabled={isSubmitting || isDecided} className="bg-green-600 hover:bg-green-700">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check />}
                    อนุมัติ
                </Button>
                <Button variant="destructive" onClick={() => handleDecision('rejected')} disabled={isSubmitting || isDecided}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X />}
                    ปฏิเสธ
                </Button>
            </div>
             {isDecided && (
                <p className="text-sm font-medium text-muted-foreground">มีการตัดสินใจสำหรับใบสมัครนี้แล้ว</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
