'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Category, CATEGORIES } from '@/types';
import ProductCard from '@/components/ProductCard';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products with filters
  const { data: response, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/products?${params}`);
      return res.json();
    },
  });

  const products = response?.data || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-secondary/30 py-12 md:py-16 lg:py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display mb-4 md:mb-6">
              Our Collection
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Discover timeless fragrances crafted for the modern soul
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-8 md:py-12 lg:py-16">
        {/* Search and Filter Bar */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search fragrances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border bg-background focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Filter Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-6 py-3 border border-border hover:bg-secondary transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="uppercase text-sm tracking-wide">Filters</span>
            </button>
          </div>

          {/* Category Filters - Desktop */}
          <div className="hidden md:flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "px-6 py-2 text-sm uppercase tracking-wide transition-all",
                selectedCategory === 'all'
                  ? "bg-foreground text-background"
                  : "border border-border hover:bg-secondary"
              )}
            >
              All Products
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={cn(
                  "px-6 py-2 text-sm uppercase tracking-wide transition-all",
                  selectedCategory === category.value
                    ? "bg-foreground text-background"
                    : "border border-border hover:bg-secondary"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Category Filters - Mobile Drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 border border-border p-4 bg-background"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg">Filter by Category</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-secondary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setShowFilters(false);
                    }}
                    className={cn(
                      "px-4 py-3 text-left text-sm uppercase tracking-wide transition-all",
                      selectedCategory === 'all'
                        ? "bg-foreground text-background"
                        : "border border-border hover:bg-secondary"
                    )}
                  >
                    All Products
                  </button>
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => {
                        setSelectedCategory(category.value);
                        setShowFilters(false);
                      }}
                      className={cn(
                        "px-4 py-3 text-left text-sm uppercase tracking-wide transition-all",
                        selectedCategory === category.value
                          ? "bg-foreground text-background"
                          : "border border-border hover:bg-secondary"
                      )}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid-products">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton h-[400px] md:h-[500px]" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid-products"
          >
            {products.map((product: Product) => (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 md:py-24">
            <p className="text-muted-foreground text-lg">
              No products found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
