'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export default function StudentEvaluationPage() {
  const [ratings, setRatings] = useState({
    workQuality: 3,
    punctuality: 4,
    problemSolving: 5,
    teamwork: 3,
    learningAttitude: 3
  });

  const [comment, setComment] = useState('');

  const handleRatingChange = (category: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const renderStars = (category: string, currentRating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer ${
              star <= currentRating 
                ? 'fill-orange-500 text-orange-500' 
                : 'text-gray-300'
            }`}
            onClick={() => handleRatingChange(category, star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-amber-700 mb-2">แบบประเมินสถานประกอบการ</h1>
        </div>

        {/* Personal Information */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-amber-700">ข้อมูลส่วนตัว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-amber-700 font-medium">ชื่อจริง-นามสกุล (Full-name) : </span>
                <span className="text-gray-900">นายรักดี จิตดี</span>
              </div>
              <div>
                <span className="text-amber-700 font-medium">รหัสนักศึกษา (Student ID) : </span>
                <span className="text-gray-900">6400112233</span>
              </div>
              <div>
                <span className="text-amber-700 font-medium">ประเภท (Type) : </span>
                <span className="text-gray-900">สหกิจศึกษา</span>
              </div>
              <div>
                <span className="text-amber-700 font-medium">เลขทะเบียนบริษัท (Registration no.) : </span>
                <span className="text-gray-900">0105547002456</span>
              </div>
              <div>
                <span className="text-amber-700 font-medium">ชื่อบริษัท (Company) : </span>
                <span className="text-gray-900">บริษัท ABC จำกัด</span>
              </div>
              <div>
                <span className="text-amber-700 font-medium">ตำแหน่ง (Position) : </span>
                <span className="text-gray-900">IT</span>
              </div>
              <div>
                <span className="text-amber-700 font-medium">แผนก (Department) : </span>
                <span className="text-gray-900">IT</span>
              </div>
              <div>
                <span className="text-amber-700 font-medium">อาจารย์นิเทศ (Academic advisor) : </span>
                <span className="text-gray-900">อาจารย์ A</span>
              </div>
              <div>
                <span className="text-amber-700 font-medium">ระยะเวลา (Duration) : </span>
                <span className="text-gray-900">15 มิ.ย. 2568 - 15 ต.ค. 2568</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-amber-700 font-medium">ที่อยู่บริษัท (Address) : </span>
                <span className="text-gray-900">1/11 ต.สุขุม อ.เมือง จ.เชียงใหม่</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Form */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-amber-700">กรุณาให้คะแนน</CardTitle>
            <p className="text-sm text-gray-600">(1 = น้อยมาก, 5 = มากที่สุด)</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="bg-orange-500 text-white p-3 text-left font-medium">เกณฑ์</th>
                    <th className="bg-orange-500 text-white p-3 text-center font-medium">ให้คะแนน</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-orange-50">
                    <td className="p-3 border-b">ความเหมาะสมของลักษณะงานกับสาขาวิชาที่เรียน</td>
                    <td className="p-3 border-b text-center">
                      {renderStars('workQuality', ratings.workQuality)}
                    </td>
                  </tr>
                  <tr className="bg-orange-50">
                    <td className="p-3 border-b">ความเป็นมิตรและให้ความร่วมมือของพนักงาน</td>
                    <td className="p-3 border-b text-center">
                      {renderStars('punctuality', ratings.punctuality)}
                    </td>
                  </tr>
                  <tr className="bg-orange-50">
                    <td className="p-3 border-b">สภาพแวดล้อมในการทำงาน (ความสะอาด ปลอดภัย)</td>
                    <td className="p-3 border-b text-center">
                      {renderStars('problemSolving', ratings.problemSolving)}
                    </td>
                  </tr>
                  <tr className="bg-orange-50">
                    <td className="p-3 border-b">ความพึงพอใจในการมอบหมายงาน</td>
                    <td className="p-3 border-b text-center">
                      {renderStars('teamwork', ratings.teamwork)}
                    </td>
                  </tr>
                  <tr className="bg-orange-50">
                    <td className="p-3">โอกาสในการเรียนรู้และพัฒนาทักษะระหว่างการฝึกงาน</td>
                    <td className="p-3 text-center">
                      {renderStars('learningAttitude', ratings.learningAttitude)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Comment Section */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-amber-700">ข้อเสนอแนะเพิ่มเติม</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                placeholder="ข้อเสนอแนะเพิ่มเติม (Comment)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <Button className="bg-amber-600 hover:bg-amber-700">
                ค้นหาอีกครั้ง
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-700">
                บันทึกและส่ง
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
