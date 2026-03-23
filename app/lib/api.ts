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
  tags: string[];
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
  free_shipping: boolean;
  tags: string[];
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

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { 
    ...options,
    headers,
    next: { revalidate: 60 } 
  });

  if (res.status === 401) {
    // Handle unauthorized (optional: redirect to login)
    if (typeof window !== 'undefined') {
      // window.location.href = '/login'; 
    }
  }

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
  cart: {
    get: (): Promise<any> => apiFetch('/api/cart'),
    addItem: (variantId: number, quantity: number): Promise<any> => 
      apiFetch('/api/cart/add_item', {
        method: 'POST',
        body: JSON.stringify({ variant_id: variantId, quantity }),
      }),
    removeItem: (variantId: number): Promise<any> =>
      apiFetch('/api/cart/remove_item', {
        method: 'DELETE',
        body: JSON.stringify({ variant_id: variantId }),
      }),
  },
  auth: {
    login: async (email: string, password: string): Promise<any> => {
      const res = await fetch(`${BASE}/users/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ user: { email, password } }),
      });
      const data = await res.json();
      if (res.ok && data.data?.token) {
        localStorage.setItem('token', data.data.token);
      }
      return { ok: res.ok, data };
    },
    register: async (name: string, email: string, password: string): Promise<any> => {
      const res = await fetch(`${BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ user: { name, email, password, password_confirmation: password } }),
      });
      const data = await res.json();
      if (res.ok && data.data?.token) {
        localStorage.setItem('token', data.data.token);
      }
      return { ok: res.ok, data };
    },
    logout: async (): Promise<any> => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE}/users/sign_out`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      localStorage.removeItem('token');
      return { ok: res.ok };
    },
    verifyOtp: async (email: string, otp_code: string): Promise<any> => {
      const res = await fetch(`${BASE}/api/auth/verify_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, otp_code }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    }
  }
};
