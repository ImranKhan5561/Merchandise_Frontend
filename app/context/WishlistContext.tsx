'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, ProductCard } from '../lib/api';

interface WishlistContextType {
  wishlist: ProductCard[];
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: ProductCard) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const handleAuthChange = () => {
      const newToken = localStorage.getItem('token');
      setIsAuthenticated(!!newToken);
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // Fetch wishlist when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    async function fetchWishlist() {
      setLoading(true);
      try {
        const res = await api.wishlist.list();
        if (res.ok && res.data) {
          setWishlist(res.data.products || []);
        }
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [isAuthenticated]);

  const isInWishlist = (productId: number) => wishlist.some(p => p.id === productId);

  const toggleWishlist = async (product: ProductCard) => {
    if (!isAuthenticated) {
      // Trigger login modal or redirect? 
      // For now, let's just alert or redirect to login
      window.location.href = '/login';
      return;
    }

    const itemExists = isInWishlist(product.id);

    // Optimistic Update
    if (itemExists) {
      setWishlist(prev => prev.filter(p => p.id !== product.id));
    } else {
      setWishlist(prev => [...prev, product]);
    }

    try {
      if (itemExists) {
        await api.wishlist.removeItem(product.id);
      } else {
        await api.wishlist.addItem(product.id);
      }
      // Trigger a sync event if needed
      window.dispatchEvent(new Event('wishlist-change'));
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      // Rollback on error
      if (itemExists) {
        setWishlist(prev => [...prev, product]);
      } else {
        setWishlist(prev => prev.filter(p => p.id !== product.id));
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
