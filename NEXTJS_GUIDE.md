# Scented Bazaar - Next.js Implementation Guide

## 🎯 Overview

This is the **Next.js 15 version** of the Scented Bazaar e-commerce platform. Unlike the previous Express + React version, this implementation uses Next.js for both frontend and backend, providing a unified, modern development experience.

---

## 🆚 Next.js vs Express Version

### Key Differences

| Feature | Next.js Version | Express + React Version |
|---------|----------------|------------------------|
| **Architecture** | Full-stack in one framework | Separate frontend/backend |
| **Routing** | File-based (App Router) | Manual routing setup |
| **API** | API Routes + Server Actions | Express REST API |
| **SSR/SSG** | Built-in, automatic | Not available |
| **Performance** | Server Components reduce JS | More client-side JS |
| **Deployment** | Vercel, Netlify (easy) | Separate deployments |
| **Development** | Single dev server | Two dev servers |
| **Learning Curve** | Next.js specific patterns | Standard React + Express |

### When to Use Which?

**Choose Next.js if:**
- ✅ You want the latest React features (Server Components)
- ✅ You prioritize performance and SEO
- ✅ You prefer file-based routing
- ✅ You want easy deployment (Vercel)
- ✅ You're building a content-heavy site

**Choose Express + React if:**
- ✅ You need more backend flexibility
- ✅ You're familiar with traditional REST APIs
- ✅ You want separate frontend/backend deployment
- ✅ You're building a complex backend with many services
- ✅ Your team knows Express well

---

## 🏗️ Architecture

### App Router Structure

```
app/
├── (auth)/              # Route group (doesn't affect URL)
│   ├── login/
│   │   └── page.tsx     # /login
│   └── signup/
│       └── page.tsx     # /signup
├── api/                 # API Routes
│   ├── auth/
│   │   └── route.ts     # POST /api/auth
│   ├── products/
│   │   ├── route.ts     # GET /api/products
│   │   └── [id]/
│   │       └── route.ts # GET /api/products/:id
│   └── stripe/
│       ├── checkout/
│       │   └── route.ts # POST /api/stripe/checkout
│       └── webhook/
│           └── route.ts # POST /api/stripe/webhook
├── products/
│   ├── page.tsx         # /products (list)
│   └── [id]/
│       └── page.tsx     # /products/:id (detail)
├── cart/
│   └── page.tsx         # /cart
├── checkout/
│   └── page.tsx         # /checkout
├── dashboard/
│   └── page.tsx         # /dashboard
├── layout.tsx           # Root layout (wraps all pages)
├── page.tsx             # / (homepage)
├── providers.tsx        # Client providers (React Query)
└── globals.css          # Global styles
```

### Server vs Client Components

**Server Components (default)**
```tsx
// app/page.tsx
// Runs on server, can access DB directly
export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('products').select('*');
  return <ProductGrid products={data} />;
}
```

**Client Components**
```tsx
// components/AddToCart.tsx
'use client'; // Required for hooks, event handlers

export default function AddToCart() {
  const [count, setCount] = useState(1);
  return <button onClick={() => setCount(count + 1)}>Add {count}</button>;
}
```

### Data Fetching Patterns

**1. Server Component (Recommended for initial data)**
```tsx
async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();
  
  return <ProductDetail product={product} />;
}
```

**2. API Route + React Query (For client-side fetching)**
```tsx
// app/api/products/route.ts
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('products').select('*');
  return NextResponse.json({ data });
}

// Component
'use client';
function Products() {
  const { data } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      return res.json();
    },
  });
}
```

**3. Server Actions (For mutations)**
```tsx
// app/actions/cart.ts
'use server';

export async function addToCart(formData: FormData) {
  const productId = formData.get('productId');
  const supabase = await createServerSupabaseClient();
  await supabase.from('cart_items').insert({ product_id: productId });
  revalidatePath('/cart'); // Refresh cart page
}

// Component
'use client';
function AddToCartButton({ productId }: { productId: string }) {
  return (
    <form action={addToCart}>
      <input type="hidden" name="productId" value={productId} />
      <button type="submit">Add to Cart</button>
    </form>
  );
}
```

---

## 🔐 Authentication with Supabase SSR

### Setup

**Server-side authentication** (Server Components, API Routes, Server Actions):
```tsx
import { createServerSupabaseClient } from '@/lib/supabase';

const supabase = await createServerSupabaseClient();
const { data: { user } } = await supabase.auth.getUser();
```

**Client-side authentication** (Client Components):
```tsx
import { createClient } from '@/lib/supabase';

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Protected Routes

**Middleware approach** (recommended):
```tsx
// middleware.ts
import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/checkout/:path*'],
};
```

---

## 💳 Stripe Integration

### Checkout Flow

**1. Create Checkout Session (API Route)**
```tsx
// app/api/stripe/checkout/route.ts
export async function POST(request: NextRequest) {
  const session = await stripe.checkout.sessions.create({
    line_items: [...],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
  });
  
  return NextResponse.json({ url: session.url });
}
```

**2. Handle Webhook (API Route)**
```tsx
// app/api/stripe/webhook/route.ts
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  
  if (event.type === 'checkout.session.completed') {
    // Update order status
  }
  
  return NextResponse.json({ received: true });
}
```

---

## 📱 Responsive Design Implementation

### Tailwind Utilities

```tsx
<div className="
  px-6              // Mobile: 24px
  sm:px-8           // Tablet: 32px
  lg:px-12          // Desktop: 48px
  xl:px-16          // Large: 64px
">
  <div className="
    grid
    grid-cols-1      // Mobile: 1 column
    sm:grid-cols-2   // Tablet: 2 columns
    lg:grid-cols-3   // Desktop: 3 columns
    xl:grid-cols-4   // Large: 4 columns
    gap-6 lg:gap-8
  ">
    {/* Products */}
  </div>
</div>
```

### Custom Classes

```css
/* app/globals.css */
.container-custom {
  @apply max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16;
}

.grid-products {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8;
}
```

### Next.js Image Optimization

```tsx
import Image from 'next/image';

<Image
  src={product.image_url}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

---

## 🚀 Deployment

### Vercel (Recommended)

**1. Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

**2. Deploy**
1. Go to [vercel.com](https://vercel.com)
2. Import repository
3. Add environment variables
4. Deploy

**3. Post-Deployment**
- Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
- Update Stripe webhook URL to `https://yourdomain.com/api/stripe/webhook`
- Test all flows

### Environment Variables in Vercel

Add these in Project Settings > Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
```

---

## 📊 Performance Optimization

### 1. Server Components
Use Server Components by default to reduce client-side JavaScript.

### 2. Route Segment Config
```tsx
// app/products/page.tsx
export const dynamic = 'force-dynamic'; // Always fresh
// OR
export const revalidate = 3600; // Revalidate every hour
```

### 3. Streaming with Suspense
```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />
      </Suspense>
      <FastComponent />
    </div>
  );
}
```

### 4. Parallel Data Fetching
```tsx
async function Page() {
  // Fetch in parallel
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);
  
  return <ProductGrid products={products} categories={categories} />;
}
```

---

## 🧪 Development Tips

### Hot Reload
Next.js has excellent hot reload. Changes appear instantly without full page refresh.

### Debugging
```tsx
// Server Component logs appear in terminal
console.log('Server:', data);

// Client Component logs appear in browser
'use client';
console.log('Client:', data);
```

### Type Safety
```tsx
// Use TypeScript for everything
interface PageProps {
  params: { id: string };
  searchParams: { filter?: string };
}

export default async function Page({ params, searchParams }: PageProps) {
  // Fully typed!
}
```

---

## 📚 Key Files Reference

### Essential Files

**`app/layout.tsx`** - Root layout, wraps all pages
**`app/page.tsx`** - Homepage
**`app/providers.tsx`** - Client-side providers (React Query)
**`lib/supabase.ts`** - Supabase client utilities
**`lib/utils.ts`** - Helper functions
**`types/index.ts`** - Shared TypeScript types

### API Routes

**`app/api/auth/route.ts`** - Authentication
**`app/api/products/route.ts`** - Products list
**`app/api/products/[id]/route.ts`** - Single product
**`app/api/stripe/checkout/route.ts`** - Create checkout
**`app/api/stripe/webhook/route.ts`** - Handle webhooks

---

## 🎓 Learning Resources

### Official Docs
- [Next.js 15 Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### Best Practices
- Use Server Components by default
- Client Components only when needed (hooks, event handlers)
- Fetch data as close to where it's needed as possible
- Use TypeScript for everything
- Implement proper error boundaries

---

## 🆘 Common Issues

### Issue: "Headers already sent" error
**Solution**: Don't try to set headers after returning response in API routes.

### Issue: Hydration mismatch
**Solution**: Ensure server and client render the same HTML. Avoid `localStorage` in Server Components.

### Issue: Authentication not working
**Solution**: Check that you're using the correct Supabase client (server vs browser).

### Issue: Images not loading
**Solution**: Add domain to `next.config.js` `images.remotePatterns`.

### Issue: Webhook not receiving events
**Solution**: Use Stripe CLI for local testing, correct URL for production.

---

## ✨ Next.js Advantages

1. **Performance** - Server Components, automatic code splitting
2. **SEO** - Server-side rendering out of the box
3. **Developer Experience** - File-based routing, fast refresh
4. **Deployment** - One-click deploy to Vercel
5. **Modern React** - Latest features (Server Components, Actions)
6. **Type Safety** - First-class TypeScript support
7. **Optimization** - Image, font, script optimization automatic
8. **Scalability** - Edge runtime, incremental static regeneration

---

## 🎊 You're Ready!

Your Next.js Scented Bazaar is production-ready. Just follow the setup steps in README.md and you'll be live in 15 minutes!

**Happy coding! 🚀**
