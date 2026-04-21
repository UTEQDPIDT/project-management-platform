'use client';

import { useState } from 'react';
import MockLoginForm from '@/components/forms/mock-login-form';
import MockRegisterForm from '@/components/forms/mock-register-form';
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
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google/login`;
  };

  return (
    <div>
      <main className="flex justify-center items-center w-full h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              {mode === 'login' ? 'Ingresa a tu cuenta' : 'Crea tu cuenta'}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Inicia sesión con tu correo institucional de la UTEQ'
                : 'Registra tu cuenta para comenzar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={mode === 'login' ? 'default' : 'outline'}
                onClick={() => setMode('login')}
              >
                Iniciar sesión
              </Button>
              <Button
                type="button"
                variant={mode === 'register' ? 'default' : 'outline'}
                onClick={() => setMode('register')}
              >
                Registrarse
              </Button>
            </div>

            {mode === 'login' ? <MockLoginForm /> : <MockRegisterForm />}
            {/* <CardAction>
              <Button onClick={handleGoogleLogin}>
                <FaGoogle />
                Iniciar sesión con Google
              </Button>
            </CardAction> */}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
