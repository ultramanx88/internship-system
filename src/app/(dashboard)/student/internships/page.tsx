'use client';

import { useState, useMemo } from 'react';
import { internships as mockInternships } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Search, Building, MapPin } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

export default function StudentInternshipsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredInternships = useMemo(() => {
        return mockInternships.filter(internship => {
            const matchesSearch =
                internship.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                internship.company.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                internship.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            
            const matchesType = typeFilter === 'all' || internship.type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [debouncedSearchTerm, typeFilter]);

    const typeTranslations: { [key: string]: string } = {
        'internship': 'ฝึกงาน',
        'co_op': 'สหกิจศึกษา'
    };

    return (
        <div className="grid gap-8 text-secondary-600">
            <div>
                <h1 className="text-3xl font-bold gradient-text">ค้นหาการฝึกงาน</h1>
                <p>สำรวจและค้นหาโอกาสในการฝึกงานและสหกิจศึกษา</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="ค้นหาตำแหน่ง, บริษัท, หรือทักษะ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="ประเภททั้งหมด" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ประเภททั้งหมด</SelectItem>
                                <SelectItem value="internship">ฝึกงาน</SelectItem>
                                <SelectItem value="co_op">สหกิจศึกษา</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInternships.length > 0 ? (
                            filteredInternships.map(internship => (
                                <Card key={internship.id} className="flex flex-col">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-xl">{internship.title}</CardTitle>
                                            <Badge variant={internship.type === 'co_op' ? 'default' : 'secondary'}>
                                                {typeTranslations[internship.type]}
                                            </Badge>
                                        </div>
                                        <CardDescription className="flex items-center pt-1">
                                            <Building className="h-4 w-4 mr-2"/>
                                            {internship.company}
                                        </CardDescription>
                                        <CardDescription className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-2"/>
                                            {internship.location}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-sm text-muted-foreground line-clamp-3">{internship.description}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild className="w-full">
                                            <Link href={`/student/internships/${internship.id}`}>
                                                <Briefcase className="mr-2 h-4 w-4" />
                                                ดูรายละเอียดและสมัคร
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-muted-foreground">ไม่พบตำแหน่งงานที่ตรงกับเงื่อนไขของคุณ</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
