'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardAction,
  CardTitle,
} from '@/components/ui/card';
import { FaGoogle } from 'react-icons/fa';

export default function Home() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/api/auth/google/login';
  };

  return (
    <div>
      <main className="flex justify-center items-center w-full h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Ingresa a tu cuenta</CardTitle>
            <CardDescription>
              Inicia sesión con tu correo institucional de la UTEQ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardAction>
              <Button onClick={handleGoogleLogin}>
                <FaGoogle />
                Iniciar sesión con Google
              </Button>
            </CardAction>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
