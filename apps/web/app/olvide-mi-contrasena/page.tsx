'use client';

import ForgotPasswordForm from '@/components/forms/forgot-password-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  return (
    <main className="flex justify-center items-center p-4 w-full h-screen bg-linear-to-b from-white to-[#242D55] from-15%">
      <Card className="w-full max-w-md gap-4 border-black opacity-80">
        <div className='flex items-center justify-center gap-4 p-2'>
          <Image src="/prep-logo-azul.svg" alt="PREP Logo" width={120} height={120} className='shrink-0'/>
        </div>
        <CardHeader className='text-center'>
          <CardTitle className='font-normal text-xl'>¿Olvidaste tu contraseña?</CardTitle>
          <CardDescription className='text-sm text-muted-foreground font-normal'>
            Ingresa tu correo institucional y te enviaremos un enlace para
            establecer una nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ForgotPasswordForm />
          <p className="text-sm text-center text-muted-foreground font-normal">
            <Link href="/" className="underline underline-offset-4 hover:text-foreground">
              Volver al inicio de sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
