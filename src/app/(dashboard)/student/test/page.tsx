'use client';

import { useAuth } from '@/hooks/use-auth';

export default function TestPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Test Page</h1>
      <p>User: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Roles: {JSON.stringify(user.roles)}</p>
    </div>
  );
}
