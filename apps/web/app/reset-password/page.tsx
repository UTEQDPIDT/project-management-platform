import ResetPasswordForm from '@/components/forms/reset-password-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="flex justify-center items-center w-full h-screen bg-linear-to-b from-white to-[#242D55] from-15%">
        <Card className="w-full max-w-md opacity-80 gap-4 border-black">
          <div>
            <Image src="/prep-logo-azul.svg" alt="PREP Logo" width={120} height={120} className='shrink-0 mx-auto p-2'/>
          </div>
          <CardHeader className='text-center'>
            <CardTitle>Enlace inválido</CardTitle>
            <CardDescription>
              Este enlace es inválido o ha expirado. Solicita uno nuevo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
    <main className="flex justify-center items-center w-full h-screen bg-linear-to-b from-white to-[#242D55] from-15%">
      <Card className="w-full max-w-md opacity-80 gap-4 border-black">
        <div>
          <Image src="/prep-logo-azul.svg" alt="PREP Logo" width={120} height={120} className='shrink-0 mx-auto p-2'/>
        </div>
        <CardHeader className='text-center'>
          <CardTitle className='font-normal'>Restablecer contraseña</CardTitle>
          <CardDescription className='font-normal'>
            Ingresa tu correo institucional y tu nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
