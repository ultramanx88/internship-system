'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export default function TestCompaniesPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const testAPI = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/companies?page=1&limit=5');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        testAPI();
    }, []);

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader>
                    <CardTitle>ทดสอบ Companies API</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Button onClick={testAPI} disabled={loading}>
                            {loading ? 'กำลังโหลด...' : 'ทดสอบ API'}
                        </Button>
                        
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded">
                                <p className="text-red-600">Error: {error}</p>
                            </div>
                        )}
                        
                        {data && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded">
                                <p className="text-green-600">Success!</p>
                                <pre className="mt-2 text-sm overflow-auto">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}