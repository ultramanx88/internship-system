'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function TestPage() {
    const { user, loading } = useAuth();

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader>
                    <CardTitle>หน้าทดสอบ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p>หน้านี้ทำงานแล้ว!</p>
                        
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                            <h3 className="font-semibold">ข้อมูล Authentication:</h3>
                            <p>Loading: {loading ? 'Yes' : 'No'}</p>
                            <p>User: {user ? JSON.stringify(user, null, 2) : 'No user'}</p>
                        </div>
                        
                        <Button onClick={() => window.location.reload()}>
                            Reload Page
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}