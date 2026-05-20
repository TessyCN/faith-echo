import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import SortSelect, { SortOption } from "@/components/SortSelect";
import TestimonyArchiveCard from "@/components/TestimonyArchiveCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetCategories, useGetPublishedTestimonies } from "@/services/testimonies.service";
import type { TestimonyCategory } from "@/types";
import { SkeletonTestimonyLoader } from "@/components/TestimonyLoaderSkeleton";
import { useDebounce } from "@/hooks/useDebounce";

const ITEMS_PER_PAGE = 9;

const Testimonies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any | "All">("All");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [categorySlug, setCategorySlug] = useState<string>("");




  const debounceSearchQuery = useDebounce(searchQuery, 2000)



  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

const handleSetCategorySlug = (value: string) => {
  if (value === "All") {
    setCategorySlug("");
  } else {
    setCategorySlug(value);
  }
};

  const handleCategoryChange = (value: TestimonyCategory) => {
    handleSetCategorySlug(value.slug);
    setCurrentPage(1);
    setSelectedCategory(value.slug);
    console.log("categorySlug", value.slug);
  };
  const handleSortChange = (value: SortOption) => { setSortOption(value); setCurrentPage(1); };

  const testimonies = useGetPublishedTestimonies(
    {
      search: debounceSearchQuery,
      categorySlug,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    }
  );
  const categories = useGetCategories();

  return (
    <>
      <Helmet>
        <title>Testimonies Archive | FFI Testimonies</title>
        <meta
          name="description"
          content="Browse inspiring stories of faith, healing, provision, deliverance, and breakthrough from our church community and around the world"
        />
        <meta property="og:title" content="Testimonies Archive | FFI Testimonies" />
        <meta
          property="og:description"
          content="Browse inspiring stories of faith, healing, provision, deliverance, and breakthrough from our church community."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-12 md:py-16 border-b border-border">
            <div className="container text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Testimonies Archive
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Browse and be inspired by stories of faith and breakthrough.
              </p>
            </div>
          </section>

          {/* Search and Filters */}
          <section className="py-8 border-b border-border bg-muted/30">
            <div className="container space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <SearchBar value={searchQuery} onChange={handleSearchChange} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    className={selectedCategory === "All" ? "bg-primary/90 text-primary-foreground hover:bg-primary/90" : "bg-white text-primary border border-primary hover:bg-secondary/90"}
                    onClick={() => {
                      setSelectedCategory("All");
                      setCategorySlug("");
                      setCurrentPage(1);
                    }}
                  >
                    All
                  </Button>
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    category={categories.data}
                    filterByCategory={handleCategoryChange}
                  />
                </div>
                <SortSelect value={sortOption} onChange={handleSortChange} />
              </div>
            </div>
          </section>

          {/* Testimonies Grid */}
          <section className="py-12 md:py-16">
            <div className="container">

              {
                testimonies.isPending && <SkeletonTestimonyLoader />
              }
              {testimonies.data?.data ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonies.data?.data ? testimonies.data?.data?.map((testimony, index) => (
                      <TestimonyArchiveCard
                        key={testimony.id}
                        id={testimony.id}
                        title={testimony.title}
                        snippet={testimony.content}
                        contributor={testimony.authorName}
                        category={testimony.category}
                        mediaType={testimony.mediaType === "pdf" ? undefined : testimony.mediaType}
                        index={index}
                      />
                    )) : <div className="flex mx-auto w-full flex-col items-center justify-center">
                      <h2 className="text-center text-lg font-medium text-foreground mt-16">No testimonies found</h2>
                      <p className="text-center text-muted-foreground mt-4">Check back later for inspiring stories of faith and breakthrough</p>
                    </div>}
                  </div>

                  {/* Pagination */}
                  {currentPage < testimonies.data?.meta?.totalPages && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">


                        <Button
                          key={currentPage}
                          variant={currentPage === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(currentPage)}
                          className="w-9 h-9 p-0"
                        >
                          {currentPage}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={currentPage === testimonies.data?.meta?.totalPages}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, testimonies.data?.meta?.total)} of {testimonies.data?.meta?.total} testimonies
                  </p>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No testimonies found matching your criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setCategorySlug("");
                      setCurrentPage(1);
                    }}
                    className="mt-4 text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Testimonies;
