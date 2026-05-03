export type StockStatus = 'instock' | 'outofstock' | 'onbackorder';
export type ProductType = 'simple' | 'variable' | 'grouped' | 'external';
export type ProductStatus = 'publish' | 'draft' | 'pending' | 'private';
export type BackordersStatus = 'no' | 'notify' | 'yes';

export interface ProductImage {
  id: number;
  src: string;
  alt: string;
  name: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface ProductDefaultAttribute {
  id: number;
  name: string;
  option: string;
}

export interface ProductDimensions {
  length: string;
  width: string;
  height: string;
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: ProductType;
  status: ProductStatus;
  featured: boolean;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  price_html: string;
  stock_status: StockStatus;
  stock_quantity: number | null;
  manage_stock: boolean;
  weight: string;
  dimensions: ProductDimensions;
  categories: ProductCategory[];
  tags: Array<{ id: number; name: string; slug: string }>;
  images: ProductImage[];
  attributes: ProductAttribute[];
  default_attributes: ProductDefaultAttribute[];
  variations: number[];
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  lang?: string;
}

export interface VariationAttribute {
  id: number;
  name: string;
  slug: string;
  option: string;
}

export interface WooProductVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: StockStatus;
  stock_quantity: number | null;
  manage_stock: boolean;
  backorders: BackordersStatus;
  backorders_allowed: boolean;
  backordered: boolean;
  weight: string;
  dimensions: ProductDimensions;
  image: ProductImage | null;
  attributes: VariationAttribute[];
  description: string;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: {
    id: number;
    src: string;
    alt: string;
    name: string;
  } | null;
  count: number;
}

export interface WooProductsParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: number;
  tag?: number;
  featured?: boolean;
  on_sale?: boolean;
  orderby?: 'date' | 'id' | 'title' | 'price' | 'popularity' | 'rating';
  order?: 'asc' | 'desc';
  status?: ProductStatus;
  include?: string;
  exclude?: string;
  lang?: string;
}

export interface WooCategoriesParams {
  page?: number;
  per_page?: number;
  parent?: number;
  search?: string;
  hide_empty?: boolean;
  orderby?: 'id' | 'include' | 'name' | 'slug' | 'term_group' | 'description' | 'count';
  order?: 'asc' | 'desc';
  lang?: string;
}

export type SortOption = 'latest' | 'price_low' | 'price_high' | 'popular';
