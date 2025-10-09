'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Eye, EyeOff, Settings, Users, BarChart3 } from 'lucide-react';

interface ConsentData {
  id: string;
  userId: string;
  consentType: string;
  isConsented: boolean;
  consentDate: string;
  withdrawalDate?: string;
  consentVersion: string;
  ipAddress?: string;
  userAgent?: string;
}

interface AnonymizationRule {
  id: string;
  tableName: string;
  columnName: string;
  anonymizationType: string;
  maskPattern?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ConsentStats {
  totalUsers: number;
  consentBreakdown: Record<string, number>;
}

export function PDPAManagement() {
  const [consents, setConsents] = useState<ConsentData[]>([]);
  const [rules, setRules] = useState<AnonymizationRule[]>([]);
  const [stats, setStats] = useState<ConsentStats>({ totalUsers: 0, consentBreakdown: {} });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('consent');

  // New rule form
  const [newRule, setNewRule] = useState({
    tableName: '',
    columnName: '',
    anonymizationType: 'MASK',
    maskPattern: '',
  });

  // Consent filters
  const [consentFilters, setConsentFilters] = useState({
    userId: '',
    consentType: 'all',
  });

  const fetchConsents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (consentFilters.userId) params.append('userId', consentFilters.userId);
      
      const response = await fetch(`/api/admin/pdpa/consent?${params}`);
      const data = await response.json();
      
      if (consentFilters.userId) {
        setConsents(Array.isArray(data) ? data : []);
      } else {
        // Ensure data has the expected structure
        setStats({
          totalUsers: data?.totalUsers || 0,
          consentBreakdown: data?.consentBreakdown || {}
        });
      }
    } catch (error) {
      console.error('Failed to fetch consents:', error);
      // Set safe defaults on error
      if (consentFilters.userId) {
        setConsents([]);
      } else {
        setStats({ totalUsers: 0, consentBreakdown: {} });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/admin/pdpa/anonymization');
      const data = await response.json();
      setRules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
      setRules([]);
    }
  };

  const createRule = async () => {
    try {
      const response = await fetch('/api/admin/pdpa/anonymization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule),
      });

      if (response.ok) {
        setNewRule({ tableName: '', columnName: '', anonymizationType: 'MASK', maskPattern: '' });
        await fetchRules();
        alert('สร้างกฎการปกปิดข้อมูลสำเร็จ');
      } else {
        alert('สร้างกฎการปกปิดข้อมูลไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to create rule:', error);
      alert('สร้างกฎการปกปิดข้อมูลไม่สำเร็จ');
    }
  };

  const toggleConsent = async (userId: string, consentType: string, isConsented: boolean) => {
    try {
      const response = await fetch('/api/admin/pdpa/consent', {
        method: isConsented ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          consentType,
          isConsented: !isConsented,
        }),
      });

      if (response.ok) {
        await fetchConsents();
        alert(`${isConsented ? 'ถอน' : 'ให้'}ความยินยอมสำเร็จ`);
      } else {
        alert(`${isConsented ? 'ถอน' : 'ให้'}ความยินยอมไม่สำเร็จ`);
      }
    } catch (error) {
      console.error('Failed to toggle consent:', error);
      alert(`${isConsented ? 'ถอน' : 'ให้'}ความยินยอมไม่สำเร็จ`);
    }
  };

  useEffect(() => {
    if (activeTab === 'consent') {
      fetchConsents();
    } else if (activeTab === 'anonymization') {
      fetchRules();
    }
  }, [activeTab, consentFilters]);

  const getConsentTypeLabel = (type: string) => {
    switch (type) {
      case 'data_collection': return 'การเก็บรวบรวมข้อมูล';
      case 'data_processing': return 'การประมวลผลข้อมูล';
      case 'data_sharing': return 'การแชร์ข้อมูล';
      case 'marketing': return 'การตลาด';
      default: return type;
    }
  };

  const getAnonymizationTypeLabel = (type: string) => {
    switch (type) {
      case 'MASK': return 'ปกปิด';
      case 'HASH': return 'แฮช';
      case 'REMOVE': return 'ลบ';
      case 'PSEUDONYMIZE': return 'ใช้ชื่อปลอม';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            การจัดการ PDPA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="consent">ความยินยอม</TabsTrigger>
              <TabsTrigger value="anonymization">การปกปิดข้อมูล</TabsTrigger>
              <TabsTrigger value="statistics">สถิติ</TabsTrigger>
            </TabsList>

            <TabsContent value="consent" className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    placeholder="กรองตาม User ID"
                    value={consentFilters.userId}
                    onChange={(e) => setConsentFilters(prev => ({ ...prev, userId: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="consentType">ประเภทความยินยอม</Label>
                  <Select
                    value={consentFilters.consentType}
                    onValueChange={(value) => setConsentFilters(prev => ({ ...prev, consentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ทั้งหมด" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="data_collection">การเก็บรวบรวมข้อมูล</SelectItem>
                      <SelectItem value="data_processing">การประมวลผลข้อมูล</SelectItem>
                      <SelectItem value="data_sharing">การแชร์ข้อมูล</SelectItem>
                      <SelectItem value="marketing">การตลาด</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {consentFilters.userId ? (
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-4">กำลังโหลด...</div>
                  ) : consents.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">ไม่พบข้อมูลความยินยอม</div>
                  ) : (
                    consents.map((consent) => (
                      <Card key={consent.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant={consent.isConsented ? 'default' : 'secondary'}>
                                  {consent.isConsented ? 'ยินยอม' : 'ไม่ยินยอม'}
                                </Badge>
                                <span className="font-medium">
                                  {getConsentTypeLabel(consent.consentType)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                วันที่: {new Date(consent.consentDate).toLocaleDateString('th-TH')}
                                {consent.withdrawalDate && (
                                  <span className="ml-2">
                                    ถอนเมื่อ: {new Date(consent.withdrawalDate).toLocaleDateString('th-TH')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant={consent.isConsented ? 'destructive' : 'default'}
                              size="sm"
                              onClick={() => toggleConsent(consent.userId, consent.consentType, consent.isConsented)}
                            >
                              {consent.isConsented ? 'ถอนความยินยอม' : 'ให้ความยินยอม'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  กรอก User ID เพื่อดูข้อมูลความยินยอม
                </div>
              )}
            </TabsContent>

            <TabsContent value="anonymization" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>สร้างกฎการปกปิดข้อมูล</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tableName">ชื่อตาราง</Label>
                      <Input
                        id="tableName"
                        placeholder="เช่น users"
                        value={newRule.tableName}
                        onChange={(e) => setNewRule(prev => ({ ...prev, tableName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="columnName">ชื่อคอลัมน์</Label>
                      <Input
                        id="columnName"
                        placeholder="เช่น phone"
                        value={newRule.columnName}
                        onChange={(e) => setNewRule(prev => ({ ...prev, columnName: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="anonymizationType">ประเภทการปกปิด</Label>
                      <Select
                        value={newRule.anonymizationType}
                        onValueChange={(value) => setNewRule(prev => ({ ...prev, anonymizationType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MASK">ปกปิด</SelectItem>
                          <SelectItem value="HASH">แฮช</SelectItem>
                          <SelectItem value="REMOVE">ลบ</SelectItem>
                          <SelectItem value="PSEUDONYMIZE">ใช้ชื่อปลอม</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maskPattern">รูปแบบการปกปิด (สำหรับ MASK)</Label>
                      <Input
                        id="maskPattern"
                        placeholder="เช่น **-***-****"
                        value={newRule.maskPattern}
                        onChange={(e) => setNewRule(prev => ({ ...prev, maskPattern: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button onClick={createRule} className="w-full">
                    สร้างกฎการปกปิดข้อมูล
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>กฎการปกปิดข้อมูลที่มีอยู่</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ตาราง</TableHead>
                        <TableHead>คอลัมน์</TableHead>
                        <TableHead>ประเภท</TableHead>
                        <TableHead>รูปแบบ</TableHead>
                        <TableHead>สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-mono">{rule.tableName}</TableCell>
                          <TableCell className="font-mono">{rule.columnName}</TableCell>
                          <TableCell>{getAnonymizationTypeLabel(rule.anonymizationType)}</TableCell>
                          <TableCell className="font-mono">{rule.maskPattern || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                              {rule.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div className="ml-2">
                        <p className="text-sm font-medium">ผู้ใช้ทั้งหมด</p>
                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {Object.entries(stats.consentBreakdown || {}).map(([key, value]) => {
                  const [type, status] = key.split('_');
                  const isConsented = status === 'consented';
                  
                  return (
                    <Card key={key}>
                      <CardContent className="pt-4">
                        <div className="flex items-center">
                          {isConsented ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-red-600" />
                          )}
                          <div className="ml-2">
                            <p className="text-sm font-medium">
                              {getConsentTypeLabel(type)}
                            </p>
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-xs text-muted-foreground">
                              {isConsented ? 'ยินยอม' : 'ไม่ยินยอม'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
