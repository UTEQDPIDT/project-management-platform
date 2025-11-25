import Image from 'next/image';

export function NavLogo() {
  return (
    <div className="w-full flex items-center justify-left gap-3">
      <Image
        width={40}
        height={40}
        className="shrink-0"
        src="uteq-logo.svg"
        alt="Logo de la UTEQ"
      />
      <span className="text-sm font-semibold leading-tight truncate">
        Plataforma de Gestión de Proyectos
      </span>
    </div>
  );
}
