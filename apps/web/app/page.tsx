'use client';

import { useState } from 'react';
import Image from 'next/image';
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
      <main className="flex justify-center items-center w-full min-h-screen p-4 bg-linear-to-b from-white to-[#242D55] from-15%">
        <Card className="w-full max-w-md p-4 sm:p-5 gap-2 opacity-80 border-black shadow-lg">
          <CardHeader className='p-0 gap-0'>
            <div className="flex justify-center items-center gap-4 p-2">
              <Image 
                src="/uteq-logo.svg" 
                alt="UTEQ Logo" width={80} 
                height={80} 
                className='shrink-0 sm:w-28 sm:h-28'/>
              <Image 
                src="/prep-logo-azul.svg" 
                alt="PREP Logo" width={120} 
                height={120} 
                className='shrink-0 sm:w-38 sm:h-38'/>
            </div>
            <CardTitle className='text-center text-2xl sm:text-3xl font-bold mt-2'>
              {mode === 'login' ? 'Inicio de Sesión' : 'Registro'}
            </CardTitle>
            <CardDescription className="text-center text-base font-nomal">
              {mode === 'login'
                ? 'Sistema PREP'
                : 'Sistema PREP'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 grid grid-cols-2 gap-2">
              <Button
                className={
                  mode === 'login'
                    ? 'border-black bg-[#242D55] text-white font-semibold hover:bg-[#1e2547] hover:text-white cursor-pointer'
                    : 'border-black bg-background text-[#242D55] font-semibold cursor-pointer'
                }
                type="button"
                variant="outline"
                onClick={() => setMode('login')}
              >
                Iniciar sesión
              </Button>
              <Button
                className={
                  mode === 'register'
                    ? 'border-black bg-[#242D55] text-white font-semibold hover:bg-[#1e2547] hover:text-white cursor-pointer'
                    : 'border-black bg-background text-[#242D55] font-semibold cursor-pointer'
                }
                type="button"
                variant="outline"
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
