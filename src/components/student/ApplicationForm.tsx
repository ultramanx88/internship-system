'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface ApplicationFormProps {
  studentId: string;
  onApplicationSubmitted?: (application: any) => void;
}

interface Internship {
  id: string;
  title: string;
  company: {
    name: string;
    address: string;
  };
  description: string;
  requirements: string;
  startDate: string;
  endDate: string;
}

export default function ApplicationForm({ studentId, onApplicationSubmitted }: ApplicationFormProps) {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [projectTopic, setProjectTopic] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const response = await fetch('/api/internships');
      const data = await response.json();
      
      if (data.success) {
        setInternships(data.internships || []);
      } else {
        setError('ไม่สามารถดึงข้อมูลการฝึกงานได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      console.error('Error fetching internships:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInternshipId) {
      setError('กรุณาเลือกการฝึกงาน');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/student/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internshipId: selectedInternshipId,
          projectTopic: projectTopic.trim() || undefined,
          feedback: feedback.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('ส่งคำขอฝึกงานเรียบร้อย');
        setProjectTopic('');
        setFeedback('');
        setSelectedInternshipId('');
        onApplicationSubmitted?.(data.application);
      } else {
        setError(data.error || 'ไม่สามารถส่งคำขอได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการส่งคำขอ');
      console.error('Error submitting application:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedInternship = internships.find(i => i.id === selectedInternshipId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          ขอฝึกงาน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* เลือกการฝึกงาน */}
          <div className="space-y-2">
            <Label htmlFor="internship">เลือกการฝึกงาน *</Label>
            <Select value={selectedInternshipId} onValueChange={setSelectedInternshipId}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกการฝึกงานที่ต้องการ" />
              </SelectTrigger>
              <SelectContent>
                {internships.map((internship) => (
                  <SelectItem key={internship.id} value={internship.id}>
                    {internship.title} - {internship.company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* รายละเอียดการฝึกงานที่เลือก */}
          {selectedInternship && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {selectedInternship.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                <strong>บริษัท:</strong> {selectedInternship.company.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>ที่อยู่:</strong> {selectedInternship.company.address}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>รายละเอียด:</strong> {selectedInternship.description}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>ความต้องการ:</strong> {selectedInternship.requirements}
              </p>
              <p className="text-sm text-gray-600">
                <strong>ระยะเวลา:</strong> {selectedInternship.startDate} - {selectedInternship.endDate}
              </p>
            </div>
          )}

          {/* หัวข้อโครงการ */}
          <div className="space-y-2">
            <Label htmlFor="projectTopic">หัวข้อโครงการ (ไม่บังคับ)</Label>
            <Input
              id="projectTopic"
              value={projectTopic}
              onChange={(e) => setProjectTopic(e.target.value)}
              placeholder="ระบุหัวข้อโครงการที่ต้องการทำ"
            />
          </div>

          {/* หมายเหตุเพิ่มเติม */}
          <div className="space-y-2">
            <Label htmlFor="feedback">หมายเหตุเพิ่มเติม (ไม่บังคับ)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="ระบุข้อมูลเพิ่มเติมที่เกี่ยวข้อง"
              rows={4}
            />
          </div>

          {/* ข้อความแจ้งเตือน */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* ปุ่มส่งคำขอ */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || !selectedInternshipId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  ส่งคำขอฝึกงาน
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
