# Scented Bazaar - Next.js Full-Stack E-Commerce

A luxury perfume e-commerce platform built with Next.js 15 App Router, featuring authentication, payment processing, and database integration.

## 🌟 Features

### Core Functionality
- **🔐 Authentication** - Supabase Auth with email/password and social providers
- **💳 Payments** - Stripe integration for secure checkout
- **📦 Database** - Supabase PostgreSQL with Row Level Security
- **🛒 Shopping Cart** - Persistent cart with guest support
- **👤 User Dashboard** - Order history and profile management
- **🔍 Product Catalog** - Search, filtering, and categories
- **📱 Fully Responsive** - Optimized for all screen sizes

### Technical Highlights
- **Next.js 15** with App Router
- **Server Components** for optimal performance
- **Server Actions** for mutations
- **API Routes** for REST endpoints
- **TypeScript** throughout
- **Tailwind CSS** for styling
- **React Query** for client state
- **Supabase SSR** for authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier)
- Stripe account (test mode)

### Installation

1. **Clone and Install**
```bash
cd scented-bazaar-nextjs
npm install
```

2. **Setup Supabase**
- Create project at [supabase.com](https://supabase.com)
- Run SQL migration from `/supabase/migrations/001_initial_schema.sql`
- Copy API keys from Project Settings > API

3. **Setup Stripe**
- Create account at [stripe.com](https://stripe.com)
- Enable test mode
- Copy API keys from Developers > API Keys
- Setup webhook:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. **Configure Environment**
```bash
cp .env.example .env.local
# Edit .env.local with your keys
```

5. **Run Development Server**
```bash
npm run dev
# Open http://localhost:3000
```

## 📁 Project Structure

```
scented-bazaar-nextjs/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Auth pages group
│   │   ├── login/
│   │   └── signup/
│   ├── api/                   # API Routes
│   │   ├── auth/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── orders/
│   │   └── stripe/
│   ├── products/              # Product pages
│   │   ├── [id]/             # Dynamic product page
│   │   └── page.tsx          # Products list
│   ├── cart/                  # Cart page
│   ├── checkout/              # Checkout flow
│   ├── dashboard/             # User dashboard
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Homepage
│   ├── providers.tsx          # Client providers
│   └── globals.css            # Global styles
├── components/                # React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ProductCard.tsx
├── lib/                       # Utilities
│   ├── supabase.ts           # Supabase clients
│   ├── stripe.ts             # Stripe config
│   └── utils.ts              # Helper functions
├── types/                     # TypeScript types
│   └── index.ts
├── supabase/                  # Database
│   └── migrations/
│       └── 001_initial_schema.sql
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## 🔧 Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎨 Key Features

### Server Components
Pages and layouts use Server Components by default for optimal performance:
```tsx
// app/page.tsx - Server Component
export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true);
  
  return <ProductGrid products={products} />;
}
```

### Client Components
Interactive components use 'use client' directive:
```tsx
// components/AddToCart.tsx
'use client';

export default function AddToCart({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  // ... interactive logic
}
```

### API Routes
RESTful API with type-safe handlers:
```tsx
// app/api/products/route.ts
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('products').select('*');
  return NextResponse.json({ data });
}
```

### Server Actions
Type-safe mutations without API routes:
```tsx
// app/actions/cart.ts
'use server';

export async function addToCart(productId: string, quantity: number) {
  const supabase = await createServerSupabaseClient();
  // ... mutation logic
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (2-3 columns)
- **Desktop**: 1024px - 1440px (3-4 columns)
- **Large**: > 1440px (4+ columns)

### Container Sizes
- Mobile: 24px padding
- Tablet: 32px padding
- Desktop: 48px padding
- Max-width: 1400px

## 🔒 Security

- **Row Level Security (RLS)** in Supabase
- **Server-side authentication** with Supabase SSR
- **Input validation** with Zod schemas
- **CSRF protection** with Next.js
- **Secure cookies** for sessions
- **Environment variable** protection

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**
- Connect repository at [vercel.com](https://vercel.com)
- Add environment variables
- Deploy

3. **Update Environment**
- Set `NEXT_PUBLIC_APP_URL` to your Vercel URL
- Update Stripe webhook URL in Stripe Dashboard

### Other Platforms

Works on any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Digital Ocean

## 📊 Performance

### Optimizations
- **Image Optimization** - Next.js Image component
- **Server Components** - Reduced client JS
- **Static Generation** - Pre-rendered pages
- **Code Splitting** - Automatic by Next.js
- **React Query** - Efficient data caching
- **Edge Functions** - Low latency API routes

## 🧪 Testing

### Manual Testing
```bash
# Test checkout with Stripe test card
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

### Type Checking
```bash
npm run type-check
```

## 📈 Next Steps

### High Priority
- [ ] Product reviews
- [ ] Wishlist
- [ ] Email notifications
- [ ] Admin dashboard

### Enhancements
- [ ] Social auth (Google, Facebook)
- [ ] Discount codes
- [ ] Multi-currency
- [ ] Inventory management

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🤝 Support

Issues? Check:
1. Environment variables are set correctly
2. Supabase migrations are run
3. Stripe webhook is configured
4. Browser console for errors
5. Server logs for backend errors

## 📝 License

MIT License - Free for personal and commercial use

---

Built with ❤️ using Next.js, TypeScript, Supabase, and Stripe
