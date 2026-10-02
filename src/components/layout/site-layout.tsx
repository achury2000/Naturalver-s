import { PropsWithChildren } from 'react';
import { CartDrawer } from '@/components/cart/cart-drawer';

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

import { Header } from './header';
import { Footer } from './footer';