'use client';
import { Button } from '@repo/ui/components/base/button';

export default function Home() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/api/auth/google/login';
  };

  return (
    <div>
      <main className="flex justify-center items-center border border-blue-500 w-full h-full">
        <Button onClick={handleGoogleLogin}>Log in</Button>
      </main>
    </div>
  );
}
