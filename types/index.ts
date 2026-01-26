import { z } from "zod";

// ============================================
// DATABASE TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // In cents
  image_url: string;
  category: 'perfume' | 'cologne' | 'gift-set' | 'candle' | 'body-care';
  brand: string;
  stock: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id?: string;
  session_id?: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id?: string;
  email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  stripe_session_id?: string;
  stripe_payment_intent?: string;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_price: number;
  quantity: number;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  default_address?: ShippingAddress;
  created_at: string;
  updated_at: string;
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const shippingAddressSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  address_line1: z.string().min(1, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(1, "Full name is required"),
});

export type SignupData = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactData = z.infer<typeof contactSchema>;

export type Category = Product['category'];

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'perfume', label: 'Perfumes' },
  { value: 'cologne', label: 'Colognes' },
  { value: 'gift-set', label: 'Gift Sets' },
  { value: 'candle', label: 'Candles' },
  { value: 'body-care', label: 'Body Care' },
];

export const ORDER_STATUSES = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;
