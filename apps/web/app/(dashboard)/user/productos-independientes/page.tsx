'use client';

import {
  Header,
  HeaderAction,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import { StandaloneProductsTable } from '@/components/standalone-products-table';
import { useUserProfile } from 'context/profile-provider';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Page = () => {
  const { user } = useUserProfile();

  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading>
          <HeaderTitle>Mis Productos Independientes</HeaderTitle>
          <HeaderDescription>
            Crea y gestiona tus productos independientes.
          </HeaderDescription>
        </HeaderHeading>
        <HeaderAction className="w-full sm:w-auto mt-4 sm:mt-0">
          <Button asChild className="w-full sm:w-auto">
            <Link
              href="/user/productos-independientes/crear"
              className="flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Producto</span>
            </Link>
          </Button>
        </HeaderAction>
      </Header>

      <PageContent className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <StandaloneProductsTable userId={user._id} />
      </PageContent>
    </div>
  );
};
export default Page;
