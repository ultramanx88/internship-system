'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Download, Check, X, AlertCircle, FileText } from 'lucide-react'
import { AVAILABLE_FONTS, FontInfo } from '@/lib/fonts'
import FontStatus from './FontStatus'

export default function FontManager() {
  const [availableFonts, setAvailableFonts] = useState<FontInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  useEffect(() => {
    checkAvailableFonts()
  }, [])

  const checkAvailableFonts = async () => {
    try {
      const response = await fetch('/api/fonts/check')
      if (response.ok) {
        const fonts = await response.json()
        setAvailableFonts(fonts)
      }
    } catch (error) {
      console.error('Error checking fonts:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.ttf') && !file.name.endsWith('.otf')) {
      setUploadStatus('กรุณาเลือกไฟล์ฟอนต์ (.ttf หรือ .otf)')
      return
    }

    setIsLoading(true)
    setUploadStatus('')

    try {
      const formData = new FormData()
      formData.append('font', file)

      const response = await fetch('/api/fonts/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setUploadStatus('อัปโหลดฟอนต์สำเร็จ!')
        checkAvailableFonts()
      } else {
        const error = await response.json()
        setUploadStatus(`เกิดข้อผิดพลาด: ${error.message}`)
      }
    } catch (error) {
      setUploadStatus('เกิดข้อผิดพลาดในการอัปโหลด')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadRecommendedFonts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/fonts/download-recommended', {
        method: 'POST'
      })

      if (response.ok) {
        setUploadStatus('ดาวน์โหลดฟอนต์แนะนำสำเร็จ!')
        checkAvailableFonts()
      } else {
        setUploadStatus('ไม่สามารถดาวน์โหลดฟอนต์ได้')
      }
    } catch (error) {
      setUploadStatus('เกิดข้อผิดพลาดในการดาวน์โหลด')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">จัดการฟอนต์</h2>
          <p className="text-gray-600">อัปโหลดและจัดการฟอนต์สำหรับ PDF</p>
        </div>
      </div>

      {/* Font Status */}
      <FontStatus />

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            อัปโหลดฟอนต์
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="font-upload">เลือกไฟล์ฟอนต์ (.ttf, .otf)</Label>
            <Input
              id="font-upload"
              type="file"
              accept=".ttf,.otf"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={downloadRecommendedFonts}
              disabled={isLoading}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              {isLoading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลดฟอนต์แนะนำ'}
            </Button>
          </div>

          {uploadStatus && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              uploadStatus.includes('สำเร็จ') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {uploadStatus.includes('สำเร็จ') ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{uploadStatus}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Fonts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            ฟอนต์ที่ใช้ได้ ({availableFonts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableFonts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableFonts.map((font, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{font.name}</h3>
                    <Badge variant="outline" className="text-green-600">
                      <Check className="w-3 h-3 mr-1" />
                      ใช้ได้
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{font.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {font.supports.map((support) => (
                      <Badge key={support} variant="secondary" className="text-xs">
                        {support}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{font.filename}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ไม่มีฟอนต์ที่ใช้ได้
              </h3>
              <p className="text-gray-500 mb-4">
                กรุณาอัปโหลดฟอนต์หรือดาวน์โหลดฟอนต์แนะนำ
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Fonts */}
      <Card>
        <CardHeader>
          <CardTitle>ฟอนต์แนะนำ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_FONTS.map((font, index) => {
              const isAvailable = availableFonts.some(af => af.name === font.name)
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{font.name}</h3>
                    <Badge variant={isAvailable ? "default" : "outline"} className={
                      isAvailable ? "text-green-600" : "text-gray-500"
                    }>
                      {isAvailable ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          ติดตั้งแล้ว
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          ยังไม่ติดตั้ง
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{font.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {font.supports.map((support) => (
                      <Badge key={support} variant="secondary" className="text-xs">
                        {support}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>วิธีการใช้งาน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">การอัปโหลดฟอนต์:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>เลือกไฟล์ฟอนต์ (.ttf หรือ .otf)</li>
                <li>คลิก "เลือกไฟล์" และเลือกฟอนต์ที่ต้องการ</li>
                <li>ระบบจะอัปโหลดและตรวจสอบฟอนต์อัตโนมัติ</li>
                <li>ฟอนต์จะพร้อมใช้งานใน PDF ทันที</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">ฟอนต์ที่แนะนำ:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><strong>Sarabun</strong> - ฟอนต์ที่สวยงามและอ่านง่าย</li>
                <li><strong>TH Sarabun New</strong> - ฟอนต์มาตรฐานสำหรับเอกสารราชการ</li>
                <li><strong>Noto Sans Thai</strong> - ฟอนต์จาก Google รองรับภาษาไทยดี</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">ข้อควรทราบ:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>ฟอนต์จะถูกเก็บไว้ในโฟลเดอร์ public/fonts</li>
                <li>รองรับไฟล์ .ttf และ .otf เท่านั้น</li>
                <li>ฟอนต์ที่อัปโหลดจะใช้ได้ทันทีใน PDF</li>
                <li>ควรใช้ฟอนต์ที่รองรับภาษาไทยเพื่อผลลัพธ์ที่ดี</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}