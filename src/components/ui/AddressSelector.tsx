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
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false);
  
  // Track previous values to prevent unnecessary resets
  const [prevProvinceId, setPrevProvinceId] = useState(value.provinceId);
  const [prevDistrictId, setPrevDistrictId] = useState(value.districtId);

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const res = await fetch(`/api/address/provinces?lang=${lang}`);
        
        if (res.ok) {
          const data = await res.json();
          setProvinces(data.provinces || []);
        } else {
          console.error('Failed to load provinces:', res.status, res.statusText);
          setProvinces([]);
        }
      } catch (e) {
        console.error('Error loading provinces:', e);
        setProvinces([]);
      } finally {
        setLoadingProvinces(false);
      }
    };
    loadProvinces();
  }, [lang]);

  useEffect(() => {
    if (!value.provinceId) {
      setDistricts([]);
      setSubdistricts([]);
      setPrevProvinceId('');
      setPrevDistrictId('');
      return;
    }
    
    // Only load if province actually changed
    if (value.provinceId === prevProvinceId) {
      return;
    }
    
    setPrevProvinceId(value.provinceId);
    
    const loadDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const res = await fetch(`/api/address/districts?provinceId=${value.provinceId}&lang=${lang}`);
        
        if (res.ok) {
          const data = await res.json();
          setDistricts(data.districts || []);
        } else {
          console.error('Failed to load districts:', res.status, res.statusText);
          setDistricts([]);
        }
      } catch (e) {
        console.error('Error loading districts:', e);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };
    loadDistricts();
  }, [value.provinceId, lang, prevProvinceId]);

  useEffect(() => {
    if (!value.districtId) {
      setSubdistricts([]);
      setPrevDistrictId('');
      return;
    }
    
    // Only load if district actually changed
    if (value.districtId === prevDistrictId) {
      return;
    }
    
    setPrevDistrictId(value.districtId);
    
    const loadSubdistricts = async () => {
      try {
        setLoadingSubdistricts(true);
        const res = await fetch(`/api/address/subdistricts?districtId=${value.districtId}&lang=${lang}`);
        
        if (res.ok) {
          const data = await res.json();
          setSubdistricts(data.subdistricts || []);
        } else {
          console.error('Failed to load subdistricts:', res.status, res.statusText);
          setSubdistricts([]);
        }
      } catch (e) {
        console.error('Error loading subdistricts:', e);
        setSubdistricts([]);
      } finally {
        setLoadingSubdistricts(false);
      }
    };
    loadSubdistricts();
  }, [value.districtId, lang, prevDistrictId]);

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
            onValueChange={(provinceId) => {
              // Always update province, but only reset others if actually changed
              if (provinceId !== value.provinceId) {
                onChange({ provinceId, districtId: '', subdistrictId: '', postalCode: '' });
              }
            }}
            disabled={disabled || loadingProvinces}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                loadingProvinces 
                  ? (lang === 'en' ? 'Loading provinces...' : 'กำลังโหลดจังหวัด...')
                  : (lang === 'en' ? 'Select province' : 'เลือกจังหวัด')
              } />
            </SelectTrigger>
            <SelectContent>
              {provinces.length === 0 && !loadingProvinces ? (
                <SelectItem value="none" disabled>
                  {lang === 'en' ? 'No provinces available' : 'ไม่มีข้อมูลจังหวัด'}
                </SelectItem>
              ) : (
                provinces.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.label || p.nameTh}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {loadingProvinces && (
            <p className="text-sm text-muted-foreground">
              {lang === 'en' ? 'Loading provinces...' : 'กำลังโหลดจังหวัด...'}
            </p>
          )}
          {provinces.length === 0 && !loadingProvinces && (
            <p className="text-sm text-red-500">
              {lang === 'en' ? 'No provinces data available' : 'ไม่มีข้อมูลจังหวัด'}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>{resolvedLabels.district}</Label>
          <Select
            value={value.districtId}
            onValueChange={(districtId) => {
              // Always update district, but only reset subdistrict if actually changed
              if (districtId !== value.districtId) {
                onChange({ provinceId: value.provinceId, districtId, subdistrictId: '', postalCode: '' });
              }
            }}
            disabled={disabled || !value.provinceId || loadingDistricts}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                !value.provinceId 
                  ? (lang === 'en' ? 'Select province first' : 'เลือกจังหวัดก่อน')
                  : loadingDistricts
                  ? (lang === 'en' ? 'Loading districts...' : 'กำลังโหลดอำเภอ/เขต...')
                  : (lang === 'en' ? 'Select district' : 'เลือกอำเภอ/เขต')
              } />
            </SelectTrigger>
            <SelectContent>
              {districts.length === 0 && !loadingDistricts && value.provinceId ? (
                <SelectItem value="none" disabled>
                  {lang === 'en' ? 'No districts available' : 'ไม่มีข้อมูลอำเภอ/เขต'}
                </SelectItem>
              ) : (
                districts.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.label || d.nameTh}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {loadingDistricts && (
            <p className="text-sm text-muted-foreground">
              {lang === 'en' ? 'Loading districts...' : 'กำลังโหลดอำเภอ/เขต...'}
            </p>
          )}
          {districts.length === 0 && !loadingDistricts && value.provinceId && (
            <p className="text-sm text-red-500">
              {lang === 'en' ? 'No districts data available' : 'ไม่มีข้อมูลอำเภอ/เขต'}
            </p>
          )}
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
            disabled={disabled || !value.districtId || loadingSubdistricts}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                !value.districtId 
                  ? (lang === 'en' ? 'Select district first' : 'เลือกอำเภอก่อน')
                  : loadingSubdistricts
                  ? (lang === 'en' ? 'Loading subdistricts...' : 'กำลังโหลดตำบล/แขวง...')
                  : (lang === 'en' ? 'Select subdistrict' : 'เลือกตำบล/แขวง')
              } />
            </SelectTrigger>
            <SelectContent>
              {subdistricts.length === 0 && !loadingSubdistricts && value.districtId ? (
                <SelectItem value="none" disabled>
                  {lang === 'en' ? 'No subdistricts available' : 'ไม่มีข้อมูลตำบล/แขวง'}
                </SelectItem>
              ) : (
                subdistricts.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label || s.nameTh}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {loadingSubdistricts && (
            <p className="text-sm text-muted-foreground">
              {lang === 'en' ? 'Loading subdistricts...' : 'กำลังโหลดตำบล/แขวง...'}
            </p>
          )}
          {subdistricts.length === 0 && !loadingSubdistricts && value.districtId && (
            <p className="text-sm text-red-500">
              {lang === 'en' ? 'No subdistricts data available' : 'ไม่มีข้อมูลตำบล/แขวง'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


