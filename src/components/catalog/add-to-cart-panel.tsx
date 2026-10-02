'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { QuantitySelector } from '@/components/cart/quantity-selector';
import { Button } from '@/components/ui/Button';

interface ProductForCart {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

export function AddToCartPanel({ product }: { product: ProductForCart }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const maxStock = product.stock ?? 0;

  const handleAdd = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        maxStock,
      },
      quantity
    );
  };

  if (maxStock <= 0) {
    return (
      <p className="text-sm font-medium text-red-600">Producto agotado por el momento.</p>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <QuantitySelector value={quantity} max={maxStock} onChange={setQuantity} size="lg" />
      <Button className="w-full sm:w-auto" onClick={handleAdd}>
        Agregar al carrito
      </Button>
    </div>
  );
}