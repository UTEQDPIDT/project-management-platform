import Image from 'next/image';

export function NavLogo() {
  return (
    <div className="w-full flex items-center justify-start gap-3 select-none">
      <Image
        width={40}
        height={40}
        className="shrink-0"
        src="/uteq-logo.svg"
        alt="Logo de la UTEQ"
      />
      {/* <span className="text-base font-semibold leading-tight truncate">
        PREP
      </span> */}
    </div>
  );
}
