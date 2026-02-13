import React from 'react';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { Copy, Eraser, ExternalLink } from 'lucide-react';
import { IProduct, UserRole } from '@repo/types';
import Link from 'next/link';
import { useUserProfile } from 'context/profile-provider';
import { useRemoveProduct } from '@/hooks/events';

interface EventProductMenuProps {
  eventId: string;
  product: IProduct;
}

export default function EventProductMenu({
  eventId,
  product,
}: EventProductMenuProps) {
  const removeProduct = useRemoveProduct();

  const handleRemoveProduct = () => {
    removeProduct.mutate({ eventId, productId: product._id });
  };

  const { user } = useUserProfile();
  const rootPath = user.role === UserRole.ADMIN ? '/admin' : '/user';

  return (
    <div className="flex flex-col gap-1">
      <DropdownMenuItem onClick={handleRemoveProduct}>
        <Eraser /> Retirar producto
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href={`${rootPath}/proyectos/${product.projectId}`}>
          <ExternalLink /> Ir al proyecto
        </Link>
      </DropdownMenuItem>
      {user.role === UserRole.ADMIN && (
        <DropdownMenuItem>
          <Copy />
          Copiar ID
        </DropdownMenuItem>
      )}
    </div>
  );
}
