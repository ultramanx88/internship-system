'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddressValue {
  provinceId: string;
  districtId: string;
  subdistrictId: string;
  postalCode?: string;
}

interface AddressSelectorProps {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  disabled?: boolean;
  lang?: 'th' | 'en';
  className?: string;
  labels?: {
    province?: string;
    district?: string;
    subdistrict?: string;
    postalCode?: string;
  };
}

export default function AddressSelector({ value, onChange, disabled, lang = 'th', className, labels }: AddressSelectorProps) {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subdistricts, setSubdistricts] = useState<any[]>([]);

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const res = await fetch(`/api/address/provinces?lang=${lang}`);
        if (res.ok) {
          const data = await res.json();
          setProvinces(data.provinces || []);
        }
      } catch (e) {}
    };
    loadProvinces();
  }, [lang]);

  useEffect(() => {
    if (!value.provinceId) {
      setDistricts([]);
      setSubdistricts([]);
      return;
    }
    const loadDistricts = async () => {
      try {
        const res = await fetch(`/api/address/districts?provinceId=${value.provinceId}&lang=${lang}`);
        if (res.ok) {
          const data = await res.json();
          setDistricts(data.districts || []);
        }
      } catch (e) {}
    };
    loadDistricts();
  }, [value.provinceId, lang]);

  useEffect(() => {
    if (!value.districtId) {
      setSubdistricts([]);
      return;
    }
    const loadSubdistricts = async () => {
      try {
        const res = await fetch(`/api/address/subdistricts?districtId=${value.districtId}&lang=${lang}`);
        if (res.ok) {
          const data = await res.json();
          setSubdistricts(data.subdistricts || []);
        }
      } catch (e) {}
    };
    loadSubdistricts();
  }, [value.districtId, lang]);

  const resolvedLabels = {
    province: labels?.province || (lang === 'en' ? 'Province' : 'จังหวัด'),
    district: labels?.district || (lang === 'en' ? 'District' : 'อำเภอ/เขต'),
    subdistrict: labels?.subdistrict || (lang === 'en' ? 'Subdistrict' : 'ตำบล/แขวง'),
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{resolvedLabels.province}</Label>
          <Select
            value={value.provinceId}
            onValueChange={(provinceId) => onChange({ provinceId, districtId: '', subdistrictId: '', postalCode: '' })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={lang === 'en' ? 'Select province' : 'เลือกจังหวัด'} />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.label || p.nameTh}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{resolvedLabels.district}</Label>
          <Select
            value={value.districtId}
            onValueChange={(districtId) => onChange({ provinceId: value.provinceId, districtId, subdistrictId: '', postalCode: '' })}
            disabled={disabled || !value.provinceId}
          >
            <SelectTrigger>
              <SelectValue placeholder={value.provinceId ? (lang === 'en' ? 'Select district' : 'เลือกอำเภอ/เขต') : (lang === 'en' ? 'Select province first' : 'เลือกจังหวัดก่อน')} />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.label || d.nameTh}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label>{resolvedLabels.subdistrict}</Label>
          <Select
            value={value.subdistrictId}
            onValueChange={(subdistrictId) => {
              const found = subdistricts.find((s) => s.id === subdistrictId);
              onChange({ provinceId: value.provinceId, districtId: value.districtId, subdistrictId, postalCode: found?.postalCode || '' });
            }}
            disabled={disabled || !value.districtId}
          >
            <SelectTrigger>
              <SelectValue placeholder={value.districtId ? (lang === 'en' ? 'Select subdistrict' : 'เลือกตำบล/แขวง') : (lang === 'en' ? 'Select district first' : 'เลือกอำเภอก่อน')} />
            </SelectTrigger>
            <SelectContent>
              {subdistricts.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.label || s.nameTh}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}


