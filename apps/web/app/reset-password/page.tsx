import ResetPasswordForm from '@/components/forms/reset-password-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="flex justify-center items-center w-full h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enlace inválido</CardTitle>
            <CardDescription>
              Este enlace es inválido o ha expirado. Solicita uno nuevo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-muted-foreground">
              <Link
                href="/olvide-mi-contrasena"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Solicitar nuevo enlace
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex justify-center items-center w-full h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Restablecer contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo institucional y tu nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <ResetPasswordForm token={token} />
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
