import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import SortSelect, { SortOption } from "@/components/SortSelect";
import TestimonyArchiveCard from "@/components/TestimonyArchiveCard";
import { TestimonyCategory } from "@/components/TestimonyCard";
import { testimoniesData } from "@/data/testimonies";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 9;

const Testimonies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TestimonyCategory | "All">("All");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTestimonies = useMemo(() => {
    let result = testimoniesData.filter((t) => t.status === "approved");

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.snippet.toLowerCase().includes(query) ||
          t.contributor.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Sort
    if (sortOption === "recent") {
      result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortOption === "views") {
      result.sort((a, b) => b.views - a.views);
    }

    return result;
  }, [searchQuery, selectedCategory, sortOption]);

  // Reset page when filters change
  const totalPages = Math.ceil(filteredTestimonies.length / ITEMS_PER_PAGE);
  const paginatedTestimonies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTestimonies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTestimonies, currentPage]);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => { setSearchQuery(value); setCurrentPage(1); };
  const handleCategoryChange = (value: TestimonyCategory | "All") => { setSelectedCategory(value); setCurrentPage(1); };
  const handleSortChange = (value: SortOption) => { setSortOption(value); setCurrentPage(1); };

  return (
    <>
      <Helmet>
        <title>Testimonies Archive | Grace Testimonies</title>
        <meta
          name="description"
          content="Browse inspiring stories of faith, healing, provision, deliverance, and breakthrough from our church community."
        />
        <meta property="og:title" content="Testimonies Archive | Grace Testimonies" />
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
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />
                <SortSelect value={sortOption} onChange={handleSortChange} />
              </div>
            </div>
          </section>

          {/* Testimonies Grid */}
          <section className="py-12 md:py-16">
            <div className="container">
              {paginatedTestimonies.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedTestimonies.map((testimony) => (
                      <TestimonyArchiveCard
                        key={testimony.id}
                        id={testimony.id}
                        title={testimony.title}
                        snippet={testimony.snippet}
                        contributor={testimony.contributor}
                        category={testimony.category}
                        mediaType={testimony.mediaType === "pdf" ? undefined : testimony.mediaType}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
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
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-9 h-9 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredTestimonies.length)} of {filteredTestimonies.length} testimonies
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
