'use client';

import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';

type SortOrder = 'new' | 'old';

interface UserOption {
  id: string;
  name: string;
  email?: string;
  roles: string[];
  departmentName?: string;
  facultyName?: string;
}

interface UserMultiSelectProps {
  values: string[];
  onChange: (userIds: string[]) => void;
  roles?: string[]; // filter by roles
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  sort?: SortOrder; // new = latest first, old = oldest first
  pageSize?: number;
  maxSelected?: number;
}

export default function UserMultiSelect({ values, onChange, roles, placeholder, label, disabled, sort = 'new', pageSize = 30, maxSelected }: UserMultiSelectProps) {
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
          include: 'relations'
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

  const toggle = (id: string) => {
    const exists = values.includes(id);
    if (exists) {
      onChange(values.filter(v => v !== id));
    } else {
      if (maxSelected && values.length >= maxSelected) return;
      onChange([...values, id]);
    }
  };

  const remove = (id: string) => onChange(values.filter(v => v !== id));

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      <Input
        placeholder={placeholder || 'ค้นหาชื่อ/อีเมล/รหัสผู้ใช้'}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
      />

      {/* Selected Chips */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((id) => {
            const user = options.find(o => o.id === id);
            const label = user ? (user.name + (user.departmentName ? ` • ${user.departmentName}` : '')) : id;
            return (
              <span key={id} className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
                {label}
                <Button type="button" variant="ghost" size="icon" className="h-4 w-4" onClick={() => remove(id)}>
                  <X className="h-3 w-3" />
                </Button>
              </span>
            );
          })}
        </div>
      )}

      <div className="max-h-64 overflow-auto rounded border">
        {isLoading ? (
          <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลด...
          </div>
        ) : options.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">ไม่พบผู้ใช้</div>
        ) : (
          options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 p-2 border-b last:border-b-0 cursor-pointer hover:bg-muted/50">
              <Checkbox checked={values.includes(opt.id)} onCheckedChange={() => toggle(opt.id)} />
              <div className="flex-1">
                <div className="text-sm font-medium">{opt.name}</div>
                <div className="text-xs text-muted-foreground">
                  {opt.email || ''}{opt.departmentName ? ` • ${opt.departmentName}` : ''}{opt.facultyName ? ` • ${opt.facultyName}` : ''}
                </div>
              </div>
            </label>
          ))
        )}
      </div>
      {maxSelected && <div className="text-xs text-muted-foreground">เลือกได้สูงสุด {maxSelected} คน (เลือกแล้ว {values.length})</div>}
    </div>
  );
}


