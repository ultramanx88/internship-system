'use client';

import { useState, useEffect } from 'react';
import { useRealtimeCRUD, useRealtimeData } from '@/hooks/use-realtime-crud';
import { RealtimeStatus } from '@/components/realtime/RealtimeStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string;
  createdAt: string;
}

export default function RealtimeTestPage() {
  const { createUser, updateUser, deleteUser, isLoading, isConnected } = useRealtimeCRUD();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '123456',
    roles: '["student"]',
  });

  // Use realtime data hook
  const { data: realtimeUsers, lastUpdate } = useRealtimeData<User>('user', users);

  // Load initial users
  useEffect(() => {
    loadUsers();
  }, []);

  // Update users when realtime data changes
  useEffect(() => {
    setUsers(realtimeUsers);
  }, [realtimeUsers, lastUpdate]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Update existing user
        await updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
        });
        setEditingUser(null);
      } else {
        // Create new user
        await createUser({
          ...formData,
          id: `user_${Date.now()}`,
        });
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '123456',
        roles: '["student"]',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '123456',
      roles: user.roles,
    });
  };

  const handleDelete = async (userId: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '123456',
      roles: '["student"]',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Realtime CRUD Test</h1>
        <div className="flex items-center gap-4">
          <RealtimeStatus />
          <Button onClick={loadUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            รีเฟรช
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">ชื่อ</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ชื่อผู้ใช้"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isLoading || !isConnected}
                  className="flex-1"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : editingUser ? (
                    <Edit className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {editingUser ? 'อัปเดต' : 'เพิ่ม'}
                </Button>
                
                {editingUser && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    ยกเลิก
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              รายชื่อผู้ใช้
              <Badge variant="secondary">
                {users.length} คน
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-center text-gray-500 py-4">ไม่มีข้อมูลผู้ใช้</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleString('th-TH')}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {JSON.parse(user.roles).join(', ')}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                        disabled={isLoading}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-500">ผู้ใช้ทั้งหมด</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {isConnected ? 'เชื่อมต่อ' : 'ไม่เชื่อมต่อ'}
              </div>
              <div className="text-sm text-gray-500">สถานะ Realtime</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {lastUpdate.toLocaleTimeString('th-TH')}
              </div>
              <div className="text-sm text-gray-500">อัปเดตล่าสุด</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {isLoading ? 'กำลังโหลด' : 'พร้อม'}
              </div>
              <div className="text-sm text-gray-500">สถานะการทำงาน</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}