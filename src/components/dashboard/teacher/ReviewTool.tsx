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
        title: 'AI Recommendation Failed',
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
        title: 'Decision Submitted',
        description: `Application has been ${status}.`,
      });
      router.push('/teacher');
      router.refresh();
    } else {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: result.message,
        });
    }
  };
  
  const isDecided = application.status !== 'pending';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Decision</CardTitle>
        <CardDescription>Use the AI tool to assist your decision-making process.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Button onClick={handleGetRecommendation} disabled={isLoadingAi || !!recommendation || isDecided}>
            {isLoadingAi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoadingAi ? 'Analyzing...' : 'Get AI Recommendation'}
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {recommendation && (
          <Alert variant={recommendation.recommendation === 'approve' ? 'default' : 'destructive'} className={recommendation.recommendation === 'approve' ? 'bg-green-50 border-green-200' : ''}>
             <AlertTitle className="flex items-center gap-2">
                {recommendation.recommendation === 'approve' ? <Check className="h-5 w-5 text-green-600"/> : <X className="h-5 w-5"/>}
                AI Recommendation: <Badge variant="outline" className="capitalize">{recommendation.recommendation}</Badge>
            </AlertTitle>
            <AlertDescription className="mt-2 pl-7">
                <strong>Reason:</strong> {recommendation.reason}
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        <div className="space-y-4">
            <h3 className="font-semibold">Final Decision</h3>
             <div className="space-y-2">
                <label htmlFor="feedback" className="text-sm font-medium">Feedback (Optional)</label>
                <Textarea 
                    id="feedback"
                    placeholder="Provide feedback for the student..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={isSubmitting || isDecided}
                />
            </div>
            <div className="flex gap-4">
                <Button onClick={() => handleDecision('approved')} disabled={isSubmitting || isDecided} className="bg-green-600 hover:bg-green-700">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check />}
                    Approve
                </Button>
                <Button variant="destructive" onClick={() => handleDecision('rejected')} disabled={isSubmitting || isDecided}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X />}
                    Reject
                </Button>
            </div>
             {isDecided && (
                <p className="text-sm font-medium text-muted-foreground">A decision has already been made for this application.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
