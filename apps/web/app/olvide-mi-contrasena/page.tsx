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

export default function ForgotPasswordPage() {
  return (
    <main className="flex justify-center items-center w-full h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>¿Olvidaste tu contraseña?</CardTitle>
          <CardDescription>
            Ingresa tu correo institucional y te enviaremos un enlace para
            restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <ForgotPasswordForm />
          <p className="text-sm text-center text-muted-foreground">
            <Link href="/" className="underline underline-offset-4 hover:text-foreground">
              Volver al inicio de sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
