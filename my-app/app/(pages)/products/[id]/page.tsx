'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Heart, Share2, Loader2, ChevronDown } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useSafeToast } from '@/hooks/useSafeToast';
import Link from 'next/link';

interface Variant {
  id: string;
  printful_variant_id: string;
  name: string;
  size: string;
  color: string;
  price: number | null;
  availability: boolean;
  sku: string;
  weight?: string;
  metadata?: any;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  price: number | null;
  category_id: number;
  brand?: string;
  model?: string;
  type_name?: string;
  variant_count: number;
  is_discontinued: boolean;
  printful_id: string;
}

const DEFAULT_PRODUCT_PRICE = 100;

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { addItem } = useCart();
  const { addToast } = useSafeToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Get available sizes and colors
  const availableSizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
  const availableColors = variants
    .filter((v) => !selectedSize || v.size === selectedSize)
    .map((v) => v.color)
    .filter(Boolean);

  const selectedVariant = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  // Load product and variants
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Product not found');
        
        const data = await res.json();
        
        // API returns { success, product, variants }
        if (data.success && data.product) {
          console.log('✓ Product loaded:', data.product.name);
          console.log('✓ Variants count:', data.variants?.length || 0);
          setProduct(data.product);
          
          // Load variants from response or fetch separately
          if (data.variants && data.variants.length > 0) {
            console.log('✓ Using variants from response');
            setVariants(data.variants);
            
            // Pre-select first available options
            const firstSize = data.variants[0].size;
            setSelectedSize(firstSize);
            
            const firstColor = data.variants.find(
              (v: Variant) => v.size === firstSize
            )?.color;
            if (firstColor) setSelectedColor(firstColor);
          } else {
            // If variants not in response, fetch them separately
            console.log('⚠ No variants in response, fetching separately...');
            const variantRes = await fetch(`/api/products/${productId}/variants`);
            if (variantRes.ok) {
              const variantData = await variantRes.json();
              const variantsList = variantData.variants || [];
              console.log('✓ Variants fetched:', variantsList.length);
              setVariants(variantsList);
              
              if (variantsList.length > 0) {
                const firstSize = variantsList[0].size;
                setSelectedSize(firstSize);
                
                const firstColor = variantsList.find(
                  (v: Variant) => v.size === firstSize
                )?.color;
                if (firstColor) setSelectedColor(firstColor);
              }
            }
          }
        } else {
          throw new Error(data.error || 'Failed to load product');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error loading product';
        console.error('❌ Product load error:', errorMsg, err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      console.log('Loading product:', productId);
      loadProduct();
    }
  }, [productId]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      setAdding(true);
      
      // If variants exist and user selected one, use it
      // Otherwise use product price as fallback
      let cartItem: any;
      
      if (selectedVariant && selectedSize && selectedColor) {
        // User selected a specific variant
        const price = selectedVariant.price || DEFAULT_PRODUCT_PRICE;
        cartItem = {
          id: `${product?.id}-${selectedVariant.sku}`,
          product_id: product?.id || '',
          name: `${product?.name} - ${selectedSize} ${selectedColor}`,
          price,
          quantity,
          image_url: product?.image_url || '',
          design_id: '',
          variant: {
            size: selectedSize,
            color: selectedColor,
            sku: selectedVariant.sku,
          },
        };
      } else {
        // No variant selected - add with default/product price
        // User will select variant details at checkout or cart
        const price = product?.price || DEFAULT_PRODUCT_PRICE;
        cartItem = {
          id: `${product?.id}-default`,
          product_id: product?.id || '',
          name: product?.name || 'Product',
          price,
          quantity,
          image_url: product?.image_url || '',
          design_id: '',
          variant: {
            size: selectedSize || 'Not Selected',
            color: selectedColor || 'Not Selected',
            sku: `SKU-${product?.id}`,
          },
        };
      }

      addItem(cartItem);
      addToast(`✓ Added ${quantity} to cart!`, 'success');

      // Reset quantity after adding
      setQuantity(1);
    } catch (err) {
      console.error('Add to cart error:', err);
      addToast('Error adding to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link href="/products" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = selectedVariant?.price || product?.price || DEFAULT_PRODUCT_PRICE;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/products" className="hover:text-blue-600">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-white rounded-lg shadow-sm overflow-hidden">
            {product.image_url ? (
              <div className="relative w-full aspect-square">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
            {/* Title & Category */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.brand && (
                <p className="text-gray-600 text-sm">Brand: {product.brand}</p>
              )}
              {product.type_name && (
                <p className="text-gray-600 text-sm">Type: {product.type_name}</p>
              )}
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-blue-600">
                  ${displayPrice.toFixed(2)}
                </span>
                {product.price && selectedVariant?.price && product.price !== selectedVariant.price && (
                  <span className="text-lg text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
              {product.is_discontinued && (
                <p className="text-red-600 font-semibold mt-2">Discontinued</p>
              )}
            </div>

            {/* Variant Selection */}
            {variants.length > 0 && (
              <div className="mb-6 space-y-4">
                <p className="text-sm text-gray-600 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  💡 Select size and color options below, or add to cart and choose at checkout.
                </p>
                {/* Size Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Size <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSize}
                      onChange={(e) => {
                        setSelectedSize(e.target.value);
                        // Auto-select first available color for new size
                        const firstColor = variants.find(
                          (v) => v.size === e.target.value
                        )?.color;
                        if (firstColor) setSelectedColor(firstColor);
                      }}
                      className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select a size</option>
                      {availableSizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Color Selection */}
                {selectedSize && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Color <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select a color</option>
                        {availableColors.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Availability Status */}
                {selectedVariant && (
                  <div className="text-sm">
                    {selectedVariant.availability ? (
                      <p className="text-green-600 font-semibold">✓ In Stock</p>
                    ) : (
                      <p className="text-red-600 font-semibold">Out of Stock</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {variants.length === 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-semibold">⚠️ No variants available</p>
                <p className="text-yellow-700 text-sm mt-1">This product doesn't have size/color options in the database.</p>
                <p className="text-yellow-700 text-sm mt-2">Check the browser console for more details.</p>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Quantity
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg w-32">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex-1 py-2 text-gray-600 hover:bg-gray-50 text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 text-center py-2 border-l border-r border-gray-300 bg-white"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex-1 py-2 text-gray-600 hover:bg-gray-50 text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#f08080] to-[#f4978e] hover:from-[#f08080]/90 hover:to-[#f4978e]/90 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all mb-3"
            >
              {adding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </>
              )}
            </button>

            {/* Wishlist & Share */}
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all">
                <Heart className="h-5 w-5" />
                Save
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all">
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </div>

            {/* Product Info */}
            {product.description && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Shipping & Returns */}
            <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
              <div className="flex gap-3">
                <div className="text-lg">🚚</div>
                <div>
                  <p className="font-semibold text-gray-900">Free Shipping</p>
                  <p>On orders over $100</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-lg">↩️</div>
                <div>
                  <p className="font-semibold text-gray-900">Easy Returns</p>
                  <p>30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <Link
            href="/products"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    </div>
  );
}
