'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice, cn } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="product-card">
      <Link href={`/products/${product.id}`}>
        <div className="product-image-wrapper">
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className={cn(
              "product-image",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.featured && (
            <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 text-xs uppercase tracking-wide">
              Featured
            </div>
          )}
        </div>

        <div className="p-4 md:p-6">
          <div className="mb-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              {product.brand}
            </p>
            <h3 className="font-display text-lg md:text-xl mb-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>

          <p className="text-sm md:text-base text-muted-foreground line-clamp-2 mb-4">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="font-display text-xl md:text-2xl">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm uppercase tracking-wide text-primary group-hover:underline">
              View Details →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
