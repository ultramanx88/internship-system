'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, RefreshCw, FileText, AlertCircle } from 'lucide-react'

interface FontTestResult {
  availableFonts: number
  fontsList: Array<{
    name: string
    filename: string
    exists: boolean
  }>
  bestFont: string
  fontTest: {
    success: boolean
    size?: number
    font?: string
    error?: string
  } | null
  status: string
}

export default function FontStatus() {
  const [fontStatus, setFontStatus] = useState<FontTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    checkFontStatus()
  }, [])

  const checkFontStatus = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/fonts/test')
      if (response.ok) {
        const result = await response.json()
        setFontStatus(result)
      } else {
        throw new Error('Failed to check font status')
      }
    } catch (error) {
      setError(`เกิดข้อผิดพลาด: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            สถานะฟอนต์ระบบ
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={checkFontStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบใหม่'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {fontStatus && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {fontStatus.availableFonts}
                </div>
                <div className="text-sm text-blue-700">ฟอนต์ที่ใช้ได้</div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-lg font-semibold text-green-600 truncate">
                  {fontStatus.bestFont}
                </div>
                <div className="text-sm text-green-700">ฟอนต์ที่เลือกใช้</div>
              </div>
              
              <div className={`border rounded-lg p-4 ${
                fontStatus.fontTest?.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {fontStatus.fontTest?.success ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${
                    fontStatus.fontTest?.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {fontStatus.fontTest?.success ? 'ทำงานได้' : 'มีปัญหา'}
                  </span>
                </div>
                <div className={`text-sm ${
                  fontStatus.fontTest?.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  การทดสอบฟอนต์
                </div>
              </div>
            </div>

            {/* Font Test Details */}
            {fontStatus.fontTest && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-semibold mb-2">รายละเอียดการทดสอบ:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>ฟอนต์ที่ทดสอบ:</strong> {fontStatus.fontTest.font}
                  </div>
                  {fontStatus.fontTest.success ? (
                    <div>
                      <strong>ขนาดไฟล์:</strong> {formatFileSize(fontStatus.fontTest.size || 0)}
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <strong>ข้อผิดพลาด:</strong> {fontStatus.fontTest.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fonts List */}
            <div>
              <h4 className="font-semibold mb-3">รายการฟอนต์ที่ใช้ได้:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fontStatus.fontsList.map((font, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{font.name}</div>
                      <div className="text-sm text-gray-500">{font.filename}</div>
                    </div>
                    <Badge variant={font.exists ? "default" : "secondary"} className={
                      font.exists ? "text-green-600" : "text-gray-500"
                    }>
                      {font.exists ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          พร้อมใช้
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          ไม่พบ
                        </>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {fontStatus.availableFonts === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">คำแนะนำ</span>
                </div>
                <p className="text-yellow-700 text-sm">
                  ไม่พบฟอนต์ไทยในระบบ กรุณาดาวน์โหลดฟอนต์แนะนำหรืออัปโหลดฟอนต์ไทย
                  เพื่อให้การแสดงผลใน PDF สวยงามขึ้น
                </p>
              </div>
            )}
          </div>
        )}

        {!fontStatus && !isLoading && !error && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">คลิก "ตรวจสอบใหม่" เพื่อดูสถานะฟอนต์</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}