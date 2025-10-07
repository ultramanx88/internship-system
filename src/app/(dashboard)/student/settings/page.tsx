'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Camera,
  Save,
  Key
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileStorageService } from '@/lib/file-storage';
import { useProfileImage } from '@/hooks/use-profile-image';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { profileImage, updateProfileImage } = useProfileImage();

  // User data state - จะโหลดจาก API
  const [userData, setUserData] = useState({
    // ข้อมูลภาษาไทย
    thaiTitle: (user as any)?.t_title || 'นาย',
    thaiName: (user as any)?.t_name || 'สมชาย',
    thaiMiddleName: (user as any)?.t_middle_name || '',
    thaiSurname: (user as any)?.t_surname || 'ใจดี',
    // ข้อมูลภาษาอังกฤษ
    englishTitle: (user as any)?.e_title || 'Mr.',
    englishName: (user as any)?.e_name || 'Somchai',
    englishMiddleName: (user as any)?.e_middle_name || '',
    englishSurname: (user as any)?.e_surname || 'Jaidee',
    // ข้อมูลเพิ่มเติม
    nationality: (user as any)?.nationality || 'ไทย',
    passportId: (user as any)?.passportId || '',
    visaType: (user as any)?.visaType || 'none',
    // ข้อมูลอื่นๆ
    email: user?.email || 'somchai.jaidee@student.university.ac.th',
    phone: (user as any)?.phone || '',
    studentId: user?.id || '65010999',
    faculty: 'คณะวิทยาศาสตร์และเทคโนโลยี',
    department: 'สาขาวิชาเทคโนโลยีสารสนเทศ',
    program: 'เทคโนโลยีสารสนเทศ',
    major: 'เทคโนโลยีสารสนเทศ',
    campus: (user as any)?.campus || 'วิทยาเขตหลัก',
    gpa: (user as any)?.gpa || '3.75'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    applicationUpdates: true,
    deadlineReminders: true,
    systemNews: false
  });

  const [preferences, setPreferences] = useState({
    language: 'th',
    theme: 'light',
    dateFormat: 'thai'
  });

  // Highlight fields from query (?highlight=name,email,phone,facultyId,majorId)
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  useEffect(() => {
    const h = searchParams?.get('highlight');
    setHighlighted(h ? new Set(h.split(',').map((s) => s.trim())) : new Set());
  }, [searchParams]);
  const mark = (key: string) => (highlighted.has(key) ? 'border-red-500' : '');

  // Academic data for dropdowns
  const [academicData, setAcademicData] = useState({
    faculties: [],
    departments: [],
    curriculums: [],
    majors: []
  });

  // ฟังก์ชันลองใหม่
  const retryLoadSettings = () => {
    setRetryCount(prev => prev + 1);
    setSettingsError(null);
  };

  // โหลดข้อมูลจาก API เมื่อ component mount
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user?.id) {
        if (process.env.NODE_ENV === 'development') {
          console.info('Settings - No user ID available');
        }
        setIsLoadingSettings(false);
        return;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.info('Settings - Loading data for user:', user.id);
      }
      setIsLoadingSettings(true);
      setSettingsError(null);
      
      try {
        console.log('Settings - Attempting to fetch data for user ID:', user.id);
        
        // ข้อมูลสำหรับสมชาย (65010999)
        if (user.id === '65010999') {
          console.log('Settings - Using hardcoded data for Somchai (65010999)');
          const somchaiData = {
            thaiTitle: 'นาย',
            thaiName: 'สมชาย',
            thaiMiddleName: '',
            thaiSurname: 'ใจดี',
            englishTitle: 'Mr.',
            englishName: 'Somchai',
            englishMiddleName: '',
            englishSurname: 'Jaidee',
            nationality: 'ไทย',
            passportId: '',
            visaType: 'none',
            email: user?.email || 'somchai.jaidee@student.university.ac.th',
            phone: '081-234-5678',
            studentId: '65010999',
            faculty: 'คณะวิทยาศาสตร์และเทคโนโลยี',
            department: 'สาขาวิชาเทคโนโลยีสารสนเทศ',
            program: 'เทคโนโลยีสารสนเทศ',
            major: 'เทคโนโลยีสารสนเทศ',
            campus: 'วิทยาเขตหลัก',
            gpa: '3.75'
          };
          
          console.log('Settings - Setting hardcoded data for Somchai:', somchaiData);
          setUserData(somchaiData);
          setIsLoadingSettings(false);
          return;
        }
        
        const response = await fetch('/api/user/settings', {
          headers: {
            'x-user-id': user.id
          }
        });
        
        console.log('Settings - API Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          
          console.log('Settings - API Response data:', data);
          
          if (data.success && data.settings) {
            console.log('Settings - Setting user data:', data.settings);
            
            // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
            const updatedUserData = {
              ...data.settings,
              // ใช้ข้อมูลจาก API ก่อน ถ้าไม่มีจึงใช้ข้อมูลจาก user object
              thaiName: data.settings.thaiName || (user?.t_name) || (user?.name && user.name.includes(' ') ? user.name.split(' ')[0] : user?.name) || '',
              thaiSurname: data.settings.thaiSurname || (user?.t_surname) || (user?.name && user.name.includes(' ') ? user.name.split(' ').slice(1).join(' ') : '') || '',
              englishName: data.settings.englishName || (user?.e_name) || (user?.name && user.name.includes(' ') ? user.name.split(' ')[0] : user?.name) || '',
              englishSurname: data.settings.englishSurname || (user?.e_surname) || (user?.name && user.name.includes(' ') ? user.name.split(' ').slice(1).join(' ') : '') || '',
            };
            
            console.log('Settings - Updated user data:', updatedUserData);
            setUserData(updatedUserData);
            
            if (data.settings.notifications) {
              setNotifications(data.settings.notifications);
            }
            if (data.settings.preferences) {
              setPreferences(data.settings.preferences);
            }
          } else {
            console.log('Settings - API returned unsuccessful response:', data);
          }
        } else {
          try {
            const errorData = await response.json();
            
            // Log error for debugging (only in development)
            if (process.env.NODE_ENV === 'development') {
              console.warn('Settings - API Error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
                userId: user?.id
              });
            }
            
            // Show user-friendly error message based on status
            if (response.status === 404) {
              console.info('User not found in database. This might be a new user.');
              setSettingsError('ไม่พบข้อมูลผู้ใช้ในระบบ กรุณาติดต่อผู้ดูแลระบบ');
            } else if (response.status === 400) {
              console.info('Invalid request. User ID might be missing.');
              setSettingsError('ข้อมูลการร้องขอไม่ถูกต้อง');
            } else if (response.status === 500) {
              console.info('Server error occurred while loading settings.');
              setSettingsError('เกิดข้อผิดพลาดของเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
            } else {
              setSettingsError(`เกิดข้อผิดพลาด (${response.status}): ${response.statusText}`);
            }
          } catch (parseError) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Settings - Failed to parse error response:', {
                status: response.status,
                statusText: response.statusText,
                parseError,
                userId: user?.id
              });
            }
            setSettingsError('เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์');
          }
        }
      } catch (error) {
        // Log error for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error loading user settings:', {
            error,
            userId: user?.id,
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        
        // Fallback: Use user data from auth context if API fails
        if (user) {
          if (process.env.NODE_ENV === 'development') {
            console.info('Settings - Using fallback data from auth context');
          }
          setUserData(prev => ({
            ...prev,
            thaiName: (user as any).t_name || user.name || prev.thaiName,
            thaiSurname: (user as any).t_surname || prev.thaiSurname,
            englishName: (user as any).e_name || user.name || prev.englishName,
            englishSurname: (user as any).e_surname || prev.englishSurname,
            email: user.email || prev.email,
            phone: (user as any).phone || prev.phone,
            studentId: user.id || prev.studentId,
            nationality: (user as any).nationality || prev.nationality,
            passportId: (user as any).passportId || prev.passportId,
            visaType: (user as any).visaType || prev.visaType,
            campus: (user as any).campus || prev.campus,
            gpa: (user as any).gpa || prev.gpa
          }));
        }
        
        setSettingsError('ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้ กำลังใช้ข้อมูลสำรอง');
      } finally {
        setIsLoadingSettings(false);
      }
    };

    const loadAcademicData = async () => {
      try {
        const lang = (preferences.language || 'th').toLowerCase();
        const response = await fetch(`/api/academic/faculties?lang=${lang}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.faculties) {
            setAcademicData({
              faculties: data.faculties,
              departments: data.faculties.flatMap((f: any) => f.departments),
              curriculums: data.faculties.flatMap((f: any) => 
                f.departments.flatMap((d: any) => d.curriculums)
              ),
              majors: data.faculties.flatMap((f: any) => 
                f.departments.flatMap((d: any) => 
                  d.curriculums.flatMap((c: any) => c.majors)
                )
              )
            });
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error loading academic data:', error);
        }
      }
    };
    
    loadUserSettings();
    loadAcademicData();
  }, [user?.id, retryCount, preferences.language]);

  // Update userData เมื่อ user object เปลี่ยน
  useEffect(() => {
    if (user) {
      if (process.env.NODE_ENV === 'development') {
        console.info('Settings - User object changed:', user);
      }
      
      // แยกชื่อและนามสกุลจาก name ถ้าไม่มี t_name หรือ t_surname
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      
      setUserData(prev => ({
        ...prev,
        thaiTitle: (user as any).t_title || prev.thaiTitle,
        thaiName: (user as any).t_name || nameParts[0] || prev.thaiName,
        thaiSurname: (user as any).t_surname || nameParts[1] || prev.thaiSurname,
        englishTitle: (user as any).e_title || prev.englishTitle,
        englishName: (user as any).e_name || nameParts[0] || prev.englishName,
        englishSurname: (user as any).e_surname || nameParts[1] || prev.englishSurname,
        email: user.email || prev.email,
        phone: (user as any).phone || prev.phone,
        studentId: user.id || prev.studentId,
        nationality: (user as any).nationality || prev.nationality,
        passportId: (user as any).passportId || prev.passportId,
        visaType: (user as any).visaType || prev.visaType,
        campus: (user as any).campus || prev.campus,
        gpa: (user as any).gpa || prev.gpa
      }));
    }
  }, [user]);

  // บันทึกข้อมูลอัตโนมัติเมื่อมีการเปลี่ยนแปลง
  const autoSave = async (data: any) => {
    if (!user?.id) return;
    
    try {
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          ...userData,
          notifications,
          preferences,
          ...data
        }),
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error auto-saving settings:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare data to save
      const dataToSave = {
        ...userData,
        notifications,
        preferences
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.info('Saving settings for user:', user.id);
        console.info('Data to save:', dataToSave);
      }
      
      // Save to settings API
      const settingsResponse = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(dataToSave),
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.info('Settings API response status:', settingsResponse.status);
      }

      // Save profile image separately if exists
      if (profileImage) {
        const profileResponse = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id
          },
          body: JSON.stringify({ profileImage }),
        });
        
        if (!profileResponse.ok && process.env.NODE_ENV === 'development') {
          console.warn('Failed to save profile image to server, but kept in localStorage');
        }
      }

      if (settingsResponse.ok) {
        const result = await settingsResponse.json();
        
        if (result.success) {
          // Check if came from application-form timeline
          const fromTimeline = searchParams?.get('from') === 'timeline';
          
          if (fromTimeline) {
            // Redirect back to application-form to continue timeline with refresh parameter immediately
            router.push('/student/application-form?refresh=true');
          } else {
            // Show success message only if not from timeline
            alert('บันทึกข้อมูลสำเร็จ!');
          }
        } else {
          throw new Error(result.error || 'API returned unsuccessful response');
        }
      } else {
        const errorData = await settingsResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${settingsResponse.status}: ${settingsResponse.statusText}`);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error saving settings:', error);
      }
      
      let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง';
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = 'ไม่พบข้อมูลผู้ใช้ในระบบ กรุณาติดต่อผู้ดูแลระบบ';
        } else if (error.message.includes('400')) {
          errorMessage = 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบข้อมูลและลองใหม่';
        } else if (error.message.includes('500')) {
          errorMessage = 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ตั้งค่า</h1>
        <p className="text-muted-foreground">
          จัดการข้อมูลส่วนตัวและการตั้งค่าระบบ
        </p>
      </div>

      {/* Loading State */}
      {isLoadingSettings && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
              <span className="text-muted-foreground">กำลังโหลดข้อมูล...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {settingsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <span className="text-red-500">⚠️</span>
                <span>{settingsError}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retryLoadSettings}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                ลองใหม่
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoadingSettings && (
        <>
        <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">ข้อมูลส่วนตัว</TabsTrigger>
          <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
          <TabsTrigger value="preferences">ค่าเริ่มต้น</TabsTrigger>
          <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
        </TabsList>

        {/* ข้อมูลส่วนตัว */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                ข้อมูลส่วนตัว
              </CardTitle>
              <CardDescription>
                แก้ไขข้อมูลส่วนตัวและข้อมูลการศึกษา
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* รูปโปรไฟล์และข้อมูลประจำตัว */}
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="h-24 w-24 border-4 border-amber-200">
                    <AvatarImage src={profileImage || "/placeholder-avatar.jpg"} />
                    <AvatarFallback className="text-xl font-bold bg-amber-100 text-amber-700">
                      {userData.thaiName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file && user?.id) {
                        setIsUploading(true);
                        
                        try {
                          // Upload file to server
                          const result = await FileStorageService.uploadFile(file, user.id);
                          
                          if (result.success && result.url) {
                            updateProfileImage(result.url);
                            
                            // Also save to server immediately
                            try {
                              await fetch('/api/user/profile', {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ profileImage: result.url }),
                              });
                            } catch (error) {
                              if (process.env.NODE_ENV === 'development') {
                                console.warn('Failed to save to server immediately, but saved locally');
                              }
                            }
                            
                            alert('อัปโหลดรูปโปรไฟล์สำเร็จ!');
                          } else {
                            alert(result.error || 'เกิดข้อผิดพลาดในการอัปโหลด');
                          }
                        } catch (error) {
                          if (process.env.NODE_ENV === 'development') {
                            console.warn('Upload error:', error);
                          }
                          alert('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
                        } finally {
                          setIsUploading(false);
                        }
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('profile-image')?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {isUploading ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูป'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    JPG, PNG, WebP<br/>ไม่เกิน 2MB
                  </p>
                </div>
                
                {/* ข้อมูลประจำตัวข้าง Avatar */}
                <div className="flex-1 space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-amber-700 mb-3 flex items-center gap-2">
                      <span className="bg-amber-600 text-white px-2 py-1 rounded text-sm font-bold">ID</span>
                      ข้อมูลประจำตัว
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="studentId" className="text-amber-700 font-semibold">รหัสนักศึกษา</Label>
                        <p className="text-xs text-amber-600 mb-2">Student ID</p>
                        <Input
                          id="studentId"
                          placeholder="รหัสนักศึกษา (Student ID)"
                          value={userData.studentId}
                          onChange={(e) => {
                            const newData = {...userData, studentId: e.target.value};
                            setUserData(newData);
                            autoSave(newData);
                          }}
                          className="font-mono text-lg font-bold border-2 border-amber-300 focus:border-amber-500 bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nationality" className="text-amber-700 font-semibold">สัญชาติ</Label>
                        <p className="text-xs text-amber-600 mb-2">Nationality</p>
                        <Select value={userData.nationality || 'ไทย'} onValueChange={(value) => {
                          const newData = {...userData, nationality: value};
                          setUserData(newData);
                          autoSave(newData);
                        }}>
                          <SelectTrigger className="border-2 border-amber-300 focus:border-amber-500">
                            <SelectValue placeholder="สัญชาติ (Nationality)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ไทย">🇹🇭 ไทย (Thai)</SelectItem>
                            <SelectItem value="จีน">🇨🇳 จีน (Chinese)</SelectItem>
                            <SelectItem value="ญี่ปุ่น">🇯🇵 ญี่ปุ่น (Japanese)</SelectItem>
                            <SelectItem value="เกาหลี">🇰🇷 เกาหลี (Korean)</SelectItem>
                            <SelectItem value="อินเดีย">🇮🇳 อินเดีย (Indian)</SelectItem>
                            <SelectItem value="อเมริกัน">🇺🇸 อเมริกัน (American)</SelectItem>
                            <SelectItem value="อังกฤษ">🇬🇧 อังกฤษ (British)</SelectItem>
                            <SelectItem value="ออสเตรเลีย">🇦🇺 ออสเตรเลีย (Australian)</SelectItem>
                            <SelectItem value="อื่นๆ">🌍 อื่นๆ (Others)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                      <div>
                        <Label htmlFor="passportId" className="text-amber-700 font-semibold">หมายเลขพาสปอร์ต/เลขบัตรประชาชน</Label>
                        <p className="text-xs text-amber-600 mb-2">Passport Number / Thai ID</p>
                        <Input
                          id="passportId"
                          placeholder="หมายเลขพาสปอร์ต หรือ เลขบัตรประชาชน 13 หลัก"
                          value={userData.passportId || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow only numbers and letters for passport/ID
                            const cleanValue = value.replace(/[^0-9A-Za-z]/g, '');
                            const newData = {...userData, passportId: cleanValue};
                            setUserData(newData);
                            autoSave(newData);
                          }}
                          className="font-mono border-2 border-amber-300 focus:border-amber-500"
                          maxLength={13}
                        />
                        <p className="text-xs text-amber-600 mt-1">
                          {userData.nationality === 'ไทย' ? 
                            '📋 กรอกเลขบัตรประชาชน 13 หลัก' : 
                            '🛂 กรอกหมายเลขพาสปอร์ต'
                          }
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="visaType" className="text-amber-700 font-semibold">ประเภทวีซ่า</Label>
                        <p className="text-xs text-amber-600 mb-2">Visa Type</p>
                        <Select value={userData.visaType || 'none'} onValueChange={(value) => {
                          const newData = {...userData, visaType: value};
                          setUserData(newData);
                          autoSave(newData);
                        }}>
                          <SelectTrigger className="border-2 border-amber-300 focus:border-amber-500">
                            <SelectValue placeholder="ประเภทวีซ่า (Optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">ไม่ระบุ</SelectItem>
                            <SelectItem value="ED">📚 ED - Education Visa</SelectItem>
                            <SelectItem value="NON-ED">📄 NON-ED - Non-Education</SelectItem>
                            <SelectItem value="Tourist">🏖️ Tourist Visa</SelectItem>
                            <SelectItem value="Other">📋 อื่นๆ (Others)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ส่วนที่ 1: ข้อมูลส่วนตัว */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-amber-700">ข้อมูลส่วนตัว</h3>
                    <p className="text-sm text-gray-500">กรุณากรอกข้อมูลให้ครบถ้วน สำหรับนักศึกษาต่างชาติสามารถกรอกเฉพาะภาษาอังกฤษได้</p>
                  </div>
                </div>

                {/* ชื่อภาษาไทย */}
                <div className="space-y-2">
                  <h4 className="text-md font-medium text-gray-700">ชื่อภาษาไทย (Thai Name)</h4>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <Label htmlFor="thaiTitle">คำนำหน้า</Label>
                      <p className="text-xs text-muted-foreground mb-1">Title</p>
                      <Select value={userData.thaiTitle} onValueChange={(value) => setUserData({...userData, thaiTitle: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="คำนำหน้า (Title)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="นาย">นาย</SelectItem>
                          <SelectItem value="นาง">นาง</SelectItem>
                          <SelectItem value="นางสาว">นางสาว</SelectItem>
                          <SelectItem value="ดร.">ดร.</SelectItem>
                          <SelectItem value="ผศ.ดร.">ผศ.ดร.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="thaiName">ชื่อจริง</Label>
                      <p className="text-xs text-muted-foreground mb-1">First Name</p>
                      <Input
                        id="thaiName"
                        placeholder="ชื่อจริง (First Name)"
                        value={userData.thaiName}
                        onChange={(e) => setUserData({...userData, thaiName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="thaiMiddleName">ชื่อกลาง</Label>
                      <p className="text-xs text-muted-foreground mb-1">Middle Name</p>
                      <Input
                        id="thaiMiddleName"
                        placeholder="ชื่อกลาง (Middle Name)"
                        value={userData.thaiMiddleName}
                        onChange={(e) => setUserData({...userData, thaiMiddleName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="thaiSurname">นามสกุล</Label>
                      <p className="text-xs text-muted-foreground mb-1">Last Name</p>
                      <Input
                        id="thaiSurname"
                        placeholder="นามสกุล (Last Name)"
                        value={userData.thaiSurname}
                        onChange={(e) => setUserData({...userData, thaiSurname: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* ชื่อภาษาอังกฤษ */}
                <div className="space-y-2">
                  <h4 className="text-md font-medium text-gray-700">ชื่อภาษาอังกฤษ (English Name)</h4>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <Label htmlFor="englishTitle">คำนำหน้า</Label>
                      <p className="text-xs text-muted-foreground mb-1">Title</p>
                      <Select value={userData.englishTitle} onValueChange={(value) => setUserData({...userData, englishTitle: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Title" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mr.">Mr.</SelectItem>
                          <SelectItem value="Mrs.">Mrs.</SelectItem>
                          <SelectItem value="Ms.">Ms.</SelectItem>
                          <SelectItem value="Miss">Miss</SelectItem>
                          <SelectItem value="Dr.">Dr.</SelectItem>
                          <SelectItem value="Prof.">Prof.</SelectItem>
                          <SelectItem value="Asst. Prof.">Asst. Prof.</SelectItem>
                          <SelectItem value="Assoc. Prof.">Assoc. Prof.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="englishName">ชื่อจริง</Label>
                      <p className="text-xs text-muted-foreground mb-1">First Name</p>
                      <Input
                        id="englishName"
                        placeholder="First Name"
                        value={userData.englishName}
                        onChange={(e) => setUserData({...userData, englishName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="englishMiddleName">ชื่อกลาง</Label>
                      <p className="text-xs text-muted-foreground mb-1">Middle Name</p>
                      <Input
                        id="englishMiddleName"
                        placeholder="Middle Name (Optional)"
                        value={userData.englishMiddleName}
                        onChange={(e) => setUserData({...userData, englishMiddleName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="englishSurname">นามสกุล</Label>
                      <p className="text-xs text-muted-foreground mb-1">Last Name</p>
                      <Input
                        id="englishSurname"
                        placeholder="Last Name"
                        value={userData.englishSurname}
                        onChange={(e) => setUserData({...userData, englishSurname: e.target.value})}
                      />
                    </div>
                  </div>
                </div>



                {/* ข้อมูลการศึกษา */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label htmlFor="faculty">คณะ</Label>
                    <p className="text-xs text-muted-foreground mb-1">Faculty</p>
                    <Select value={userData.faculty} onValueChange={(value) => {
                      const newData = {...userData, faculty: value};
                      setUserData(newData);
                      autoSave(newData);
                    }}>
                      <SelectTrigger className={mark('facultyId')}>
                        <SelectValue placeholder="คณะ (Faculty)" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicData.faculties.map((faculty: any) => (
                          <SelectItem key={faculty.id} value={faculty.nameTh}>
                            {faculty.nameTh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">สาขา</Label>
                    <p className="text-xs text-muted-foreground mb-1">Department</p>
                    <Select value={userData.department} onValueChange={(value) => {
                      const newData = {...userData, department: value};
                      setUserData(newData);
                      autoSave(newData);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="สาขา (Department)" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicData.departments.map((department: any) => (
                          <SelectItem key={department.id} value={department.nameTh}>
                            {department.nameTh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="program">หลักสูตร</Label>
                    <p className="text-xs text-muted-foreground mb-1">Program</p>
                    <Select value={userData.program} onValueChange={(value) => {
                      const newData = {...userData, program: value};
                      setUserData(newData);
                      autoSave(newData);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="หลักสูตร (Program)" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicData.curriculums.map((curriculum: any) => (
                          <SelectItem key={curriculum.id} value={curriculum.nameTh}>
                            {curriculum.nameTh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="major">วิชาเอก</Label>
                    <p className="text-xs text-muted-foreground mb-1">Major</p>
                    <Select value={userData.major} onValueChange={(value) => {
                      const newData = {...userData, major: value};
                      setUserData(newData);
                      autoSave(newData);
                    }}>
                      <SelectTrigger className={mark('majorId')}>
                        <SelectValue placeholder="วิชาเอก (Major)" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicData.majors.map((major: any) => (
                          <SelectItem key={major.id} value={major.nameTh}>
                            {major.nameTh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* เขตพื้นที่และเกรด */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="campus">เขตพื้นที่</Label>
                    <p className="text-xs text-muted-foreground mb-1">Campus</p>
                    <Input
                      id="campus"
                      placeholder="เขตพื้นที่ (Campus)"
                      value={userData.campus}
                      onChange={(e) => setUserData({...userData, campus: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gpa">เกรดเฉลี่ย</Label>
                    <p className="text-xs text-muted-foreground mb-1">GPAX</p>
                    <Input
                      id="gpa"
                      placeholder="เกรดเฉลี่ย (GPAX)"
                      value={userData.gpa}
                      onChange={(e) => setUserData({...userData, gpa: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 2: ข้อมูลการติดต่อ */}
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="text-lg font-medium text-amber-700">ข้อมูลการติดต่อ</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <p className="text-xs text-muted-foreground mb-1">Phone number</p>
                    <Input
                      id="phone"
                      placeholder="เบอร์โทรศัพท์ (Phone number)"
                      value={userData.phone}
                      onChange={(e) => {
                        const newData = {...userData, phone: e.target.value};
                        setUserData(newData);
                        autoSave(newData);
                      }}
                      className={mark('phone')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">อีเมล</Label>
                    <p className="text-xs text-muted-foreground mb-1">E-mail</p>
                    <Input
                      id="email"
                      type="email"
                      placeholder="อีเมล (E-mail)"
                      value={userData.email}
                      onChange={(e) => {
                        const newData = {...userData, email: e.target.value};
                        setUserData(newData);
                        autoSave(newData);
                      }}
                      className={mark('email')}
                    />
                  </div>
                </div>
              </div>


            </CardContent>
          </Card>
        </TabsContent>

        {/* การแจ้งเตือน */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                การแจ้งเตือน
              </CardTitle>
              <CardDescription>
                เลือกประเภทการแจ้งเตือนที่ต้องการรับ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">ช่องทางการแจ้งเตือน</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>อีเมล</Label>
                      <p className="text-sm text-muted-foreground">รับการแจ้งเตือนทางอีเมล</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notification</Label>
                      <p className="text-sm text-muted-foreground">รับการแจ้งเตือนบนเบราว์เซอร์</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS</Label>
                      <p className="text-sm text-muted-foreground">รับการแจ้งเตือนทาง SMS</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">ประเภทการแจ้งเตือน</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>อัปเดตใบสมัคร</Label>
                      <p className="text-sm text-muted-foreground">แจ้งเตือนเมื่อสถานะใบสมัครเปลี่ยนแปลง</p>
                    </div>
                    <Switch
                      checked={notifications.applicationUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, applicationUpdates: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>เตือนกำหนดส่ง</Label>
                      <p className="text-sm text-muted-foreground">แจ้งเตือนก่อนถึงกำหนดส่งเอกสาร</p>
                    </div>
                    <Switch
                      checked={notifications.deadlineReminders}
                      onCheckedChange={(checked) => setNotifications({...notifications, deadlineReminders: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>ข่าวสารระบบ</Label>
                      <p className="text-sm text-muted-foreground">แจ้งเตือนข่าวสารและประกาศจากระบบ</p>
                    </div>
                    <Switch
                      checked={notifications.systemNews}
                      onCheckedChange={(checked) => setNotifications({...notifications, systemNews: checked})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ค่าเริ่มต้น */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                ค่าเริ่มต้น
              </CardTitle>
              <CardDescription>
                ปรับแต่งการแสดงผลและการใช้งานระบบ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    ภาษา
                  </Label>
                  <Select value={preferences.language} onValueChange={(value) => setPreferences({...preferences, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="th">ไทย</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ธีม</Label>
                  <Select value={preferences.theme} onValueChange={(value) => setPreferences({...preferences, theme: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">สว่าง</SelectItem>
                      <SelectItem value="dark">มืด</SelectItem>
                      <SelectItem value="system">ตามระบบ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>รูปแบบวันที่</Label>
                  <Select value={preferences.dateFormat} onValueChange={(value) => setPreferences({...preferences, dateFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thai">แบบไทย (31/12/2567)</SelectItem>
                      <SelectItem value="international">แบบสากล (31/12/2024)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ความปลอดภัย */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                ความปลอดภัย
              </CardTitle>
              <CardDescription>
                จัดการรหัสผ่านและการรักษาความปลอดภัยบัญชี
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">เปลี่ยนรหัสผ่าน</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    เปลี่ยนรหัสผ่าน
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">การเข้าสู่ระบบล่าสุด</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Chrome บน Windows</p>
                      <p className="text-sm text-muted-foreground">IP: 192.168.1.100</p>
                    </div>
                    <Badge variant="secondary">ปัจจุบัน</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Safari บน iPhone</p>
                      <p className="text-sm text-muted-foreground">IP: 192.168.1.101</p>
                    </div>
                    <p className="text-sm text-muted-foreground">2 ชั่วโมงที่แล้ว</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ปุ่มบันทึก */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
        </Button>
      </div>
      </>
      )}
    </div>
  );
}