'use client';

import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

type SortOrder = 'new' | 'old';

interface UserOption {
  id: string;
  name: string;
  email?: string;
  roles: string[];
  departmentName?: string;
  facultyName?: string;
}

interface UserSelectProps {
  value?: string;
  onChange: (userId: string) => void;
  roles?: string[]; // filter by roles
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  sort?: SortOrder; // new = latest first, old = oldest first
  pageSize?: number;
}

export default function UserSelect({ value, onChange, roles, placeholder, label, disabled, sort = 'new', pageSize = 20 }: UserSelectProps) {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<UserOption[]>([]);
  const sortParam = useMemo(() => (sort === 'new' ? 'desc' : 'asc'), [sort]);
  const roleParam = useMemo(() => (roles && roles.length > 0 ? roles[0] : 'all'), [roles]);

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          search,
          role: roleParam,
          sort: sortParam,
          page: '1',
          limit: String(pageSize),
        });
        const res = await fetch(`/api/users?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isCancelled) return;
        const mapped: UserOption[] = (data.users || []).map((u: any) => ({
          id: u.id,
          name: u.name || u.username || u.id,
          email: u.email,
          roles: Array.isArray(u.roles) ? u.roles : [],
          departmentName: u.department?.nameTh || u.department?.nameEn,
          facultyName: u.faculty?.nameTh || u.faculty?.nameEn,
        }));
        setOptions(mapped);
      } catch {
        // noop
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    load();
    return () => { isCancelled = true; };
  }, [search, roleParam, sortParam, pageSize]);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input
        placeholder="ค้นหาชื่อ/อีเมล/รหัสผู้ใช้"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
      />
      <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || 'เลือกผู้ใช้'} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลด...
            </div>
          ) : (
            options.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.name}{opt.departmentName ? ` - ${opt.departmentName}` : ''}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}


