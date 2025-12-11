import React from 'react';

export default function IconSquare({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="aspect-square h-10 bg-secondary rounded-md flex items-center justify-center">
      <span className="w-3.5 h-3.5 flex items-center justify-center">
        {children}
      </span>
    </div>
  );
}
