import Image from 'next/image';

export function NavLogo() {
  return (
    <div className="w-full flex items-center justify-start gap-3 select-none h-10">
      <Image
        width={100}
        height={50}
        className="shrink-0"
        src="/prep-logo-negro.svg"
        alt="Logo de la UTEQ"
      />
      {/* <span className="text-base font-semibold leading-tight truncate">
        PREP
      </span> */}
    </div>
  );
}
