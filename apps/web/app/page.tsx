'use client';
import { Button } from '@repo/ui/components/base/button';

export default function Home() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/api/auth/google/login';
  };

  return (
    <div>
      <main>
        <Button onClick={handleGoogleLogin}>Log in</Button>
      </main>
    </div>
  );
}
