'use client';

import { useState, useEffect } from 'react';
import { Loader2, ShoppingCart, ChevronDown, ChevronUp, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface Design {
  id: string;
  title: string;
  description: string;
  artwork_file_url?: string;
  created_at: string;
}

interface Variant {
  id: string;
  size: string;
  color: string;
  price: number;
  sku: string;
  availability: boolean;
}

interface Product {
  id: string;
  name: string;
  image_url: string;
  category_id: number;
}

interface CartItemData {
  product_id: string;
  design_id: string;
  variant: Variant;
  quantity: number;
}

export function DesignToCart() {
  const { addItem } = useCart();
  const [step, setStep] = useState<'design' | 'product' | 'variant' | 'review'>(
    'design'
  );

  const [designs, setDesigns] = useState<Design[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Load designs
  useEffect(() => {
    const loadDesigns = async () => {
      try {
        const res = await fetch('/api/designs?limit=100');
        const data = await res.json();
        setDesigns(data.designs || []);
      } catch (error) {
        console.error('Error loading designs:', error);
      } finally {
        setLoadingDesigns(false);
      }
    };
    loadDesigns();
  }, []);

  // Load products
  useEffect(() => {
    if (step === 'product') {
      const loadProducts = async () => {
        setLoadingProducts(true);
        try {
          const res = await fetch('/api/products?limit=50');
          const data = await res.json();
          setProducts(data.products || []);
        } catch (error) {
          console.error('Error loading products:', error);
        } finally {
          setLoadingProducts(false);
        }
      };
      loadProducts();
    }
  }, [step]);

  // Load variants for selected product
  useEffect(() => {
    if (selectedProduct && step === 'variant') {
      const loadVariants = async () => {
        setLoadingVariants(true);
        try {
          const res = await fetch(`/api/products/${selectedProduct.id}/variants`);
          const data = await res.json();
          setVariants(data.variants || []);
        } catch (error) {
          console.error('Error loading variants:', error);
        } finally {
          setLoadingVariants(false);
        }
      };
      loadVariants();
    }
  }, [selectedProduct, step]);

  const handleAddToCart = async () => {
    if (!selectedDesign || !selectedProduct || !selectedVariant) {
      alert('Please complete all steps');
      return;
    }

    setAddingToCart(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          design_id: selectedDesign.id,
          variant: {
            size: selectedVariant.size,
            color: selectedVariant.color,
            sku: selectedVariant.sku,
          },
          quantity,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Also update local cart context
        addItem({
          id: `${selectedProduct.id}_${selectedVariant.sku}_${selectedDesign.id}`,
          product_id: selectedProduct.id,
          name: `${selectedProduct.name} - ${selectedVariant.size} ${selectedVariant.color}`,
          price: selectedVariant.price,
          quantity,
          image_url: selectedProduct.image_url,
          design_id: selectedDesign.id,
          variant: {
            size: selectedVariant.size,
            color: selectedVariant.color,
          },
        });

        alert('Added to cart!');
        // Reset
        setSelectedDesign(null);
        setSelectedProduct(null);
        setSelectedVariant(null);
        setQuantity(1);
        setStep('design');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const progressSteps = [
    { key: 'design', label: 'Design', done: !!selectedDesign },
    { key: 'product', label: 'Product', done: !!selectedProduct },
    { key: 'variant', label: 'Size & Color', done: !!selectedVariant },
    { key: 'review', label: 'Review', done: !!selectedVariant },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Custom Merchandise</h1>

          <div className="flex items-center justify-between">
            {progressSteps.map((progressStep, idx) => (
              <div key={progressStep.key} className="flex items-center flex-1">
                <button
                  onClick={() => {
                    if (idx < progressSteps.filter((_, i) => i <= progressSteps.findIndex((p) => p.key === 'design')).length)
                      return;
                    setStep(progressStep.key as any);
                  }}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full font-bold transition ${
                    progressStep.done
                      ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                      : step === progressStep.key
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {progressStep.done ? '✓' : idx + 1}
                </button>
                <div className="ml-3">
                  <p
                    className={`text-sm font-semibold ${
                      step === progressStep.key ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {progressStep.label}
                  </p>
                </div>

                {idx < progressSteps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${
                      progressSteps[idx + 1].done ? 'bg-green-400' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Design */}
        {step === 'design' && (
          <StepSelectDesign
            designs={designs}
            loadingDesigns={loadingDesigns}
            selectedDesign={selectedDesign}
            onSelectDesign={(design) => {
              setSelectedDesign(design);
              setStep('product');
            }}
          />
        )}

        {/* Step 2: Select Product */}
        {step === 'product' && (
          <StepSelectProduct
            products={products}
            loadingProducts={loadingProducts}
            selectedProduct={selectedProduct}
            onSelectProduct={(product) => {
              setSelectedProduct(product);
              setStep('variant');
            }}
            onBack={() => setStep('design')}
          />
        )}

        {/* Step 3: Select Variant */}
        {step === 'variant' && (
          <StepSelectVariant
            product={selectedProduct}
            variants={variants}
            loadingVariants={loadingVariants}
            selectedVariant={selectedVariant}
            onSelectVariant={setSelectedVariant}
            onBack={() => setStep('product')}
            onNext={() => setStep('review')}
          />
        )}

        {/* Step 4: Review & Add to Cart */}
        {step === 'review' && (
          <StepReview
            design={selectedDesign}
            product={selectedProduct}
            variant={selectedVariant}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onBack={() => setStep('variant')}
            addingToCart={addingToCart}
          />
        )}
      </div>
    </div>
  );
}

// Step Components

interface StepSelectDesignProps {
  designs: Design[];
  loadingDesigns: boolean;
  selectedDesign: Design | null;
  onSelectDesign: (design: Design) => void;
}

function StepSelectDesign({
  designs,
  loadingDesigns,
  selectedDesign,
  onSelectDesign,
}: StepSelectDesignProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Select Your Design</h2>

      {loadingDesigns ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      ) : designs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">No designs found. Create one first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <button
              key={design.id}
              onClick={() => onSelectDesign(design)}
              className={`text-left rounded-lg overflow-hidden border-2 transition transform hover:scale-105 ${
                selectedDesign?.id === design.id
                  ? 'border-blue-600 shadow-xl'
                  : 'border-gray-200 hover:border-blue-400'
              }`}
            >
              {design.artwork_file_url ? (
                <img
                  src={design.artwork_file_url}
                  alt={design.title}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Preview</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 truncate">{design.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{design.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(design.created_at).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface StepSelectProductProps {
  products: Product[];
  loadingProducts: boolean;
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  onBack: () => void;
}

function StepSelectProduct({
  products,
  loadingProducts,
  selectedProduct,
  onSelectProduct,
  onBack,
}: StepSelectProductProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Select Product</h2>

      {loadingProducts ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className={`text-left rounded-lg overflow-hidden border-2 transition transform hover:scale-105 ${
                  selectedProduct?.id === product.id
                    ? 'border-blue-600 shadow-xl'
                    : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900">{product.name}</h3>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface StepSelectVariantProps {
  product: Product | null;
  variants: Variant[];
  loadingVariants: boolean;
  selectedVariant: Variant | null;
  onSelectVariant: (variant: Variant) => void;
  onBack: () => void;
  onNext: () => void;
}

function StepSelectVariant({
  product,
  variants,
  loadingVariants,
  selectedVariant,
  onSelectVariant,
  onBack,
  onNext,
}: StepSelectVariantProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 3: Select Size & Color</h2>

      {loadingVariants ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onSelectVariant(variant)}
                disabled={!variant.availability}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedVariant?.id === variant.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-400'
                } ${!variant.availability ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">
                      {variant.size} - {variant.color}
                    </p>
                    <p className="text-sm text-gray-600">{variant.sku}</p>
                  </div>
                  <p className="font-bold text-blue-600">${variant.price.toFixed(2)}</p>
                </div>
                {!variant.availability && (
                  <p className="text-xs text-red-600 mt-2">Out of stock</p>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Back
            </button>
            <button
              onClick={onNext}
              disabled={!selectedVariant}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 font-semibold ml-auto"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface StepReviewProps {
  design: Design | null;
  product: Product | null;
  variant: Variant | null;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBack: () => void;
  addingToCart: boolean;
}

function StepReview({
  design,
  product,
  variant,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBack,
  addingToCart,
}: StepReviewProps) {
  const totalPrice = variant ? variant.price * quantity : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 4: Review Order</h2>

      {/* Design Preview */}
      {design && (
        <div className="mb-8 pb-8 border-b-2">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Design</h3>
          <div className="flex gap-6">
            {design.artwork_file_url && (
              <img
                src={design.artwork_file_url}
                alt={design.title}
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            <div>
              <p className="font-bold text-gray-900">{design.title}</p>
              <p className="text-gray-600">{design.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Product & Variant */}
      {product && variant && (
        <div className="mb-8 pb-8 border-b-2">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Product</h3>
          <div className="flex gap-6">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            <div>
              <p className="font-bold text-gray-900">{product.name}</p>
              <p className="text-gray-600">
                {variant.size} - {variant.color}
              </p>
              <p className="text-gray-600">{variant.sku}</p>
              <p className="font-bold text-blue-600 mt-2">${variant.price.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="mb-8">
        <h3 className="font-bold text-lg text-gray-900 mb-4">Quantity</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="p-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            <Minus className="w-5 h-5" />
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 px-3 py-2 border border-gray-300 rounded text-center"
          />
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="p-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total:</span>
          <span className="text-3xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
        >
          Back
        </button>
        <button
          onClick={onAddToCart}
          disabled={addingToCart}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
        >
          {addingToCart ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
