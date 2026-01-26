import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  
  // Fetch featured products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .limit(3);

  const featuredProducts = (products || []) as Product[];

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1595425970377-c97036c88f63?q=80&w=2072&auto=format&fit=crop"
            alt="Luxury perfume ambiance"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <p className="text-sm md:text-base uppercase tracking-[0.3em] mb-6 text-white/80 animate-fade-in">
            The Essence of Elegance
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 leading-tight animate-fade-in">
            Timeless Scents <br />
            <span className="italic font-normal">for Modern Souls</span>
          </h1>
          <div className="animate-fade-in">
            <Link 
              href="/products" 
              className="inline-block bg-white text-black px-10 py-4 uppercase tracking-widest text-sm hover:bg-primary hover:text-white transition-colors duration-300"
            >
              Discover Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display mb-4">Curated Selections</h2>
            <p className="text-muted-foreground max-w-md">
              Our most coveted fragrances, chosen for their distinctive character and lasting impression.
            </p>
          </div>
          <Link 
            href="/products" 
            className="group flex items-center gap-2 text-sm uppercase tracking-widest mt-6 md:mt-0 hover:text-primary transition-colors"
          >
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid-featured">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Brand Story Teaser */}
      <section className="bg-secondary/30 py-24">
        <div className="container-custom grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-square relative overflow-hidden order-2 md:order-1">
            <Image
              src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=1000&auto=format&fit=crop"
              alt="Perfume ingredients"
              fill
              className="object-cover"
            />
          </div>
          <div className="order-1 md:order-2 md:pl-12">
            <h2 className="text-3xl md:text-4xl font-display mb-6">Artistry in Every Drop</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We believe perfume is more than just a scent—it is an invisible accessory, 
              a personal signature, and a powerful trigger of memories. Our master perfumers 
              blend rare ingredients from around the world to create olfactory masterpieces.
            </p>
            <Link href="/products" className="btn-outline inline-block">
              Explore Our Story
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
