'use client';

import { useState, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import ProductGallery from './ProductGallery';
import ProductPrice from './ProductPrice';
import StockBadge from './StockBadge';
import VariationSelector from './VariationSelector';
import ProductMeta from './ProductMeta';
import QuantitySelector from '@/components/cart/QuantitySelector';
import { useCartStore } from '@/store/cart-store';
import { toast } from '@/store/toast-store';
import {
  findMatchingVariation,
  getAvailableOptions,
  getPriceRange,
  isSelectionComplete,
  normalizeAttributeName,
} from '@/lib/variations';
import type { WooProduct, WooProductVariation } from '@/types/woocommerce';
import type { CartItem } from '@/types/cart';

interface VariationClientProps {
  product: WooProduct;
  variations: WooProductVariation[];
  locale: string;
}

export default function VariationClient({ product, variations, locale }: VariationClientProps) {
  const isAr = locale === 'ar';
  const [quantity, setQuantity] = useState(1);
  const { addItem, openDrawer } = useCartStore();

  const variationAttributes = product.attributes.filter((a) => a.variation);

  const initialSelected = useMemo(() => {
    const init: Record<string, string> = {};
    for (const da of product.default_attributes) {
      const key = normalizeAttributeName(da.name);
      let rawOption = da.option;
      let decodedOption = rawOption;
      try { decodedOption = decodeURIComponent(rawOption); } catch {}

      const attr = variationAttributes.find(a => normalizeAttributeName(a.name) === key);
      if (attr) {
        const matchingOption = attr.options.find(
          o =>
            normalizeAttributeName(o) === normalizeAttributeName(decodedOption) ||
            normalizeAttributeName(o) === normalizeAttributeName(rawOption)
        );
        if (matchingOption) init[key] = matchingOption;
      } else {
        if (decodedOption) init[key] = decodedOption;
      }
    }
    return init;
  }, [product.default_attributes, variationAttributes]);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(initialSelected);

  const availableOptions = useMemo(
    () => getAvailableOptions(variationAttributes, variations, selectedAttributes),
    [variationAttributes, variations, selectedAttributes]
  );

  const matchedVariation = useMemo(
    () => findMatchingVariation(variations, selectedAttributes),
    [variations, selectedAttributes]
  );

  const selectionComplete = isSelectionComplete(variationAttributes, selectedAttributes);
  const priceRange = useMemo(() => getPriceRange(variations), [variations]);

  const handleSelect = (attrKey: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [attrKey]: value }));
    setQuantity(1);
  };

  const displayImage = matchedVariation?.image?.src ? matchedVariation.image : null;
  const displayStockStatus = matchedVariation?.stock_status ?? product.stock_status;
  const displayStockQuantity = matchedVariation?.stock_quantity ?? product.stock_quantity;
  const displayManageStock = matchedVariation?.manage_stock ?? product.manage_stock;
  const displaySku = matchedVariation?.sku || product.sku;
  const isOutOfStock = displayStockStatus === 'outofstock';

  const canAddToCart = selectionComplete && !isOutOfStock && (matchedVariation?.purchasable ?? false);
  const maxQty = displayManageStock && displayStockQuantity ? displayStockQuantity : 999;

  const handleAddToCart = () => {
    if (!matchedVariation || !canAddToCart) return;

    const item: CartItem = {
      product_id: product.id,
      variation_id: matchedVariation.id,
      slug: product.slug,
      name: product.name,
      image: displayImage?.src ?? product.images[0]?.src ?? undefined,
      selected_attributes: selectedAttributes,
      quantity,
      price_for_display: matchedVariation.price || product.price,
      regular_price_for_display: matchedVariation.regular_price || undefined,
      sale_price_for_display: matchedVariation.on_sale ? (matchedVariation.sale_price || undefined) : undefined,
      stock_status: displayStockStatus,
      max_quantity: maxQty < 999 ? maxQty : undefined,
    };

    addItem(item);
    openDrawer();
    toast(
      isAr
        ? `تمت إضافة "${product.name}" إلى السلة`
        : `"${product.name}" added to cart`,
      'success'
    );
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Gallery */}
      <div>
        <ProductGallery
          images={product.images}
          productName={product.name}
          overrideImage={displayImage}
        />
      </div>

      {/* Details */}
      <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        {product.categories[0] && (
          <span className="text-sm font-medium uppercase tracking-wide text-accent-500">
            {product.categories[0].name}
          </span>
        )}

        <h1 className="text-3xl font-bold text-primary-800 lg:text-4xl">{product.name}</h1>

        {/* Price */}
        {matchedVariation ? (
          <ProductPrice
            price={matchedVariation.price}
            regularPrice={matchedVariation.regular_price}
            salePrice={matchedVariation.sale_price}
            onSale={matchedVariation.on_sale}
            locale={locale}
          />
        ) : (
          <ProductPrice priceRange={priceRange} locale={locale} />
        )}

        {/* Short description */}
        {product.short_description && (
          <p
            className="leading-relaxed text-neutral-600"
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />
        )}

        {/* Variation selectors */}
        <VariationSelector
          attributes={variationAttributes}
          selectedAttributes={selectedAttributes}
          availableOptions={availableOptions}
          onSelect={handleSelect}
          locale={locale}
        />

        {/* Stock status */}
        {selectionComplete && matchedVariation ? (
          <StockBadge
            stockStatus={displayStockStatus}
            stockQuantity={displayStockQuantity}
            manageStock={displayManageStock}
            locale={locale}
          />
        ) : selectionComplete && !matchedVariation ? (
          <p className="text-sm font-medium text-red-500">
            {isAr ? 'هذا التوليف غير متاح' : 'This combination is not available'}
          </p>
        ) : (
          <p className="text-sm text-neutral-400">
            {isAr ? 'اختر الخيارات لعرض التوافر' : 'Select options to see availability'}
          </p>
        )}

        {/* Quantity + Add to Cart */}
        <div className="flex items-center gap-3">
          {canAddToCart && (
            <QuantitySelector
              quantity={quantity}
              min={1}
              max={maxQty}
              onChange={setQuantity}
              locale={locale}
            />
          )}
          <button
            type="button"
            disabled={!canAddToCart}
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-3 rounded-full bg-accent-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-accent-400 hover:shadow-accent-500/30 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
          >
            <ShoppingCart className="h-5 w-5" />
            {!selectionComplete
              ? (isAr ? 'اختر الخيارات أولاً' : 'Select Options First')
              : isOutOfStock
              ? (isAr ? 'نفد من المخزون' : 'Out of Stock')
              : !matchedVariation
              ? (isAr ? 'غير متاح' : 'Not Available')
              : (isAr ? 'أضف إلى السلة' : 'Add to Cart')}
          </button>
        </div>

        {/* Meta */}
        <ProductMeta
          sku={displaySku}
          categories={product.categories}
          tags={product.tags}
          locale={locale}
        />
      </div>
    </div>
  );
}
