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
  is_master: boolean;
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

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<{ ok: boolean, data: T | any, status: number }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : null;

    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth-change'));
      }
    }

    return { ok: res.ok, data, status: res.status };
  } catch (error) {
    console.error(`API Error: ${path}`, error);
    return { ok: false, data: null, status: 500 };
  }
}

export const api = {
  products: {
    list: (params: Record<string, string | number> = {}): Promise<{ ok: boolean, data: ProductListResponse | null, status: number }> => {
      const qs = new URLSearchParams(params as Record<string, string>).toString();
      return apiFetch(`/api/products${qs ? '?' + qs : ''}`);
    },
    show: (slug: string): Promise<{ ok: boolean, data: ProductDetail | null, status: number }> =>
      apiFetch(`/api/products/${slug}`),
  },
  categories: {
    list: (): Promise<{ ok: boolean, data: Category[] | null, status: number }> => apiFetch('/api/categories'),
  },
  auth: {
    login: async (email: string, password: string): Promise<{ ok: boolean, data: any, status: number }> => {
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
        window.dispatchEvent(new Event('auth-change'));
      }
      return { ok: res.ok, data, status: res.status };
    },
    register: async (name: string, email: string, password: string): Promise<{ ok: boolean, data: any, status: number }> => {
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
        window.dispatchEvent(new Event('auth-change'));
      }
      return { ok: res.ok, data, status: res.status };
    },
    logout: async (): Promise<{ ok: boolean, data: any, status: number }> => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE}/users/sign_out`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-change'));
      return { ok: res.ok, data: null, status: res.status };
    },
    resendOtp: async (email: string): Promise<{ ok: boolean, data: any, status: number }> => {
      const res = await fetch(`${BASE}/api/auth/resend_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return { ok: res.ok, data, status: res.status };
    },
    verifyOtp: async (email: string, otp_code: string): Promise<{ ok: boolean, data: any, status: number }> => {
      const res = await fetch(`${BASE}/api/auth/verify_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, otp_code }),
      });
      const data = await res.json();
      return { ok: res.ok, data, status: res.status };
    },
    getProfile: () => apiFetch('/api/profile'),
    updateProfile: (name: string, email: string) =>
      apiFetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({ user: { name, email } }),
      }),
  },
  addresses: {
    list: () => apiFetch('/api/addresses'),
    create: (address: any) =>
      apiFetch('/api/addresses', {
        method: 'POST',
        body: JSON.stringify({ address }),
      }),
    update: (id: number, address: any) =>
      apiFetch(`/api/addresses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ address }),
      }),
    delete: (id: number) =>
      apiFetch(`/api/addresses/${id}`, {
        method: 'DELETE',
      }),
  },
  cart: {
    get: (): Promise<{ ok: boolean, data: any, status: number }> => apiFetch('/api/cart'),
    addItem: (variantId: number, quantity: number): Promise<{ ok: boolean, data: any, status: number }> =>
      apiFetch('/api/cart/add_item', {
        method: 'POST',
        body: JSON.stringify({ variant_id: variantId, quantity }),
      }).then(res => {
        if (res.ok) window.dispatchEvent(new Event('cart-change'));
        return res;
      }),
    updateItem: (variantId: number, quantity: number): Promise<{ ok: boolean, data: any, status: number }> =>
      apiFetch('/api/cart/update_item', {
        method: 'PATCH',
        body: JSON.stringify({ variant_id: variantId, quantity }),
      }).then(res => {
        if (res.ok) window.dispatchEvent(new Event('cart-change'));
        return res;
      }),
    removeItem: (variantId: number): Promise<{ ok: boolean, data: any, status: number }> =>
      apiFetch('/api/cart/remove_item', {
        method: 'DELETE',
        body: JSON.stringify({ variant_id: variantId }),
      }).then(res => {
        if (res.ok) window.dispatchEvent(new Event('cart-change'));
        return res;
      }),
  },
  orders: {
    list: (): Promise<{ ok: boolean, data: any, status: number }> => apiFetch('/api/orders'),
    create: (cartItemIds: number[], addressId: number, paymentMethod: string) =>
      apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          cart_item_ids: cartItemIds,
          address_id: addressId,
          payment_method: paymentMethod,
        }),
      }),
    cancel: (id: number): Promise<{ ok: boolean, data: any, status: number }> =>
      apiFetch(`/api/orders/${id}/cancel`, {
        method: 'PATCH',
      }),
  },
  wishlist: {
    list: (): Promise<{ ok: boolean, data: { products: ProductCard[] } | null, status: number }> =>
      apiFetch('/api/wishlist_items'),
    addItem: (productId: number): Promise<{ ok: boolean, data: any, status: number }> =>
      apiFetch('/api/wishlist_items', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
      }),
    removeItem: (productId: number): Promise<{ ok: boolean, data: any, status: number }> =>
      apiFetch(`/api/wishlist_items/${productId}`, {
        method: 'DELETE',
      }),
  }
};
