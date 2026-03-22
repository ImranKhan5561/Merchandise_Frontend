const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ProductCard {
  id: number;
  name: string;
  slug: string;
  brand: string | null;
  base_price: number;
  compare_at_price: number | null;
  discount: number;
  on_sale: boolean;
  cover_image: string | null;
  category: string | null;
}

export interface OptionValue {
  id: number;
  value: string;
  presentation: string;
}

export interface OptionType {
  id: number;
  name: string;
  presentation: string;
  is_visual: boolean;
  values: OptionValue[];
}

export interface Variant {
  id: number;
  sku: string;
  price: number;
  stock: number;
  option_value_ids: number[];
  images: string[];
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  base_price: number;
  compare_at_price: number | null;
  discount: number;
  on_sale: boolean;
  featured: boolean;
  category: { id: number; name: string } | null;
  images: string[];
  option_types: OptionType[];
  variants: Variant[];
  specifications: { name: string; value: string }[];
}

export interface Category {
  id: number;
  name: string;
  image_url: string | null;
  children: { id: number; name: string; image_url: string | null }[];
}

export interface ProductListResponse {
  products: ProductCard[];
  meta: { total: number; page: number; per_page: number; total_pages: number };
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  products: {
    list: (params: Record<string, string | number> = {}): Promise<ProductListResponse> => {
      const qs = new URLSearchParams(params as Record<string, string>).toString();
      return apiFetch(`/api/products${qs ? '?' + qs : ''}`);
    },
    show: (slug: string): Promise<ProductDetail> =>
      apiFetch(`/api/products/${slug}`),
  },
  categories: {
    list: (): Promise<Category[]> => apiFetch('/api/categories'),
  },
};
