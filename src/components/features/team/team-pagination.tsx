/**
 * Team Pagination Component
 * Displays pagination controls for members table
 */

import { Button } from "@/components/ui/button";

interface TeamPaginationProps {
  currentPage: number;
  totalPages: number;
  totalMembers: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
}

export function TeamPagination({
  currentPage,
  totalPages,
  totalMembers,
  startIndex,
  endIndex,
  onPageChange,
}: TeamPaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPagesToShow = 3;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page and neighbors
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-between">
      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Showing {startIndex} to {endIndex} of {totalMembers} members
      </p>

      {/* Pagination buttons */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-3 py-1 text-xs font-medium"
          aria-label="Previous page"
        >
          Prev
        </Button>

        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="px-3 py-1 text-xs font-medium"
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-xs font-medium"
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
