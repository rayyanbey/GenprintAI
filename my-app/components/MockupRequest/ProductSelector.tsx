'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  printful_id?: number;
  name: string;
  image?: string;
  price?: number;
}

interface ProductVariant {
  id: string;
  printful_id?: number;
  name: string;
  size?: string;
  color?: string;
  price?: number;
  availability: boolean;
}

interface Placement {
  [key: string]: string;
}

interface ProductSelectorProps {
  onSelectProduct: (productId: string, placement: string) => void;
  onSelectVariant: (variantId: number | null) => void;
  onVariantAvailabilityChange?: (hasInStockVariants: boolean | null) => void;
  selectedProductId?: string;
  selectedPlacement?: string;
  selectedVariantId?: number;
}

export default function ProductSelector({
  onSelectProduct,
  onSelectVariant,
  onVariantAvailabilityChange,
  selectedProductId,
  selectedPlacement = 'front',
  selectedVariantId,
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Placement>({
    default: 'Front',
    back: 'Back',
  });
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedPlacementLocal, setSelectedPlacementLocal] = useState(selectedPlacement);
  const [selectedVariantLocal, setSelectedVariantLocal] = useState<number | undefined>(
    selectedVariantId
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchVariants(selectedProductId);
    }
  }, [selectedProductId]);

  useEffect(() => {
    setSelectedVariantLocal(selectedVariantId);
  }, [selectedVariantId]);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setError(null);

    try {
      const response = await fetch('/api/products?page=1&limit=100');
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      const productList = data.products || [];
      
      // Map to standard format
      const mapped = productList.map((p: any) => ({
        id: String(p.id),
        printful_id: p.printful_id,
        name: p.name,
        image: p.image_url,
        price: typeof p.price === 'number' ? p.price : undefined,
      }));

      setProducts(mapped);
    } catch (err: any) {
      console.error('Product fetch error:', err);
      setError('Failed to load products from database');
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchVariants = async (productId: string) => {
    setIsLoadingVariants(true);
    onVariantAvailabilityChange?.(null);

    try {
      const response = await fetch(`/api/products/${productId}/variants`);
      if (!response.ok) throw new Error('Failed to fetch variants');

      const data = await response.json();
      if (!data.success || !Array.isArray(data.variants)) {
        throw new Error('No variants returned for selected product');
      }

      const apiPlacements: Placement = data.product?.placements || {};
      if (Object.keys(apiPlacements).length > 0) {
        setPlacements(apiPlacements);

        const placementKeys = Object.keys(apiPlacements);
        const nextPlacement = placementKeys.includes(selectedPlacementLocal)
          ? selectedPlacementLocal
          : placementKeys[0];

        if (nextPlacement && nextPlacement !== selectedPlacementLocal) {
          setSelectedPlacementLocal(nextPlacement);
          onSelectProduct(productId, nextPlacement);
        }
      }

      const inStockVariants = data.variants
        .filter((variant: any) => variant.availability !== false)
        .map((variant: any) => ({
          id: String(variant.id),
          printful_id: typeof variant.printful_id === 'number' ? variant.printful_id : undefined,
          name: variant.name,
          size: variant.size,
          color: variant.color,
          price: variant.price,
          availability: variant.availability !== false,
        }));

      setVariants(inStockVariants);
      onVariantAvailabilityChange?.(inStockVariants.length > 0);

      const nextVariantId = inStockVariants[0]?.printful_id;
      setSelectedVariantLocal(nextVariantId);
      onSelectVariant(nextVariantId || null);
    } catch (err: any) {
      console.error('Variant fetch error:', err);
      setVariants([]);
      setPlacements({ default: 'Front', back: 'Back' });
      onVariantAvailabilityChange?.(false);
      onSelectVariant(null);
    } finally {
      setIsLoadingVariants(false);
    }
  };

  const handleVariantChange = (variantId?: number) => {
    setSelectedVariantLocal(variantId);
    onSelectVariant(variantId || null);
  };

  const handlePlacementChange = (placement: string) => {
    setSelectedPlacementLocal(placement);
    if (selectedProductId) {
      onSelectProduct(selectedProductId, placement);
    }
  };

  if (isLoadingProducts) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#f4978e] animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Products Section */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Select Product</h2>
        <p className="text-xs text-gray-600 mt-1">Choose where to print</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {error && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
              {error}
            </div>
          )}
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                onSelectProduct(product.id, selectedPlacementLocal);
              }}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                selectedProductId === product.id
                  ? 'border-[#f4978e] bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{product.name}</p>
              {product.price && <p className="text-xs text-gray-600">${product.price}</p>}
              {product.printful_id && (
                <p className="text-[11px] text-gray-500 mt-1">Printful #{product.printful_id}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Variants Section */}
      {selectedProductId && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-3">Select Variant</h3>
          {isLoadingVariants ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-[#f4978e] animate-spin" />
            </div>
          ) : variants.length > 0 ? (
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => handleVariantChange(variant.printful_id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedVariantLocal === variant.printful_id
                      ? 'border-[#f4978e] bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{variant.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {variant.color || 'Color'} / {variant.size || 'Size'}
                    {typeof variant.price === 'number' ? ` • $${variant.price}` : ''}
                  </p>
                  {variant.printful_id && (
                    <p className="text-[11px] text-gray-500 mt-1">Variant #{variant.printful_id}</p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No in-stock variants available for this product.</p>
          )}
        </div>
      )}

      {/* Placements Section */}
      {selectedProductId && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-3">Print Placement</h3>
          {Object.keys(placements).length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(placements).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handlePlacementChange(key)}
                  className={`p-3 rounded-lg border-2 text-sm transition-all ${
                    selectedPlacementLocal === key
                      ? 'border-[#f4978e] bg-orange-50 font-medium text-gray-900'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No placements available</p>
          )}
        </div>
      )}
    </div>
  );
}
