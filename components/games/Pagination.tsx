"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/games?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <motion.button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, rgba(100, 200, 100, 0.2) 0%, rgba(80, 180, 80, 0.1) 100%)",
          border: "1px solid rgba(200, 240, 200, 0.3)",
          color: "rgba(200, 240, 200, 0.9)",
        }}
        whileHover={currentPage > 1 ? { scale: 1.05 } : {}}
        whileTap={currentPage > 1 ? { scale: 0.95 } : {}}
      >
        ←
      </motion.button>

      {/* Page Numbers */}
      {startPage > 1 && (
        <>
          <motion.button
            onClick={() => handlePageChange(1)}
            className="px-4 py-2 rounded-lg font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(100, 200, 100, 0.2) 0%, rgba(80, 180, 80, 0.1) 100%)",
              border: "1px solid rgba(200, 240, 200, 0.3)",
              color: "rgba(200, 240, 200, 0.9)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            1
          </motion.button>
          {startPage > 2 && (
            <span style={{ color: "rgba(200, 240, 200, 0.5)" }}>...</span>
          )}
        </>
      )}

      {pages.map((page) => (
        <motion.button
          key={page}
          onClick={() => handlePageChange(page)}
          className="px-4 py-2 rounded-lg font-semibold transition-all"
          style={{
            background: page === currentPage
              ? "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.3) 100%)"
              : "linear-gradient(135deg, rgba(100, 200, 100, 0.2) 0%, rgba(80, 180, 80, 0.1) 100%)",
            border: page === currentPage
              ? "1px solid rgba(200, 240, 200, 0.5)"
              : "1px solid rgba(200, 240, 200, 0.3)",
            color: "rgba(200, 240, 200, 0.9)",
            boxShadow: page === currentPage ? "0 0 12px rgba(100, 200, 100, 0.4)" : "none",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {page}
        </motion.button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span style={{ color: "rgba(200, 240, 200, 0.5)" }}>...</span>
          )}
          <motion.button
            onClick={() => handlePageChange(totalPages)}
            className="px-4 py-2 rounded-lg font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(100, 200, 100, 0.2) 0%, rgba(80, 180, 80, 0.1) 100%)",
              border: "1px solid rgba(200, 240, 200, 0.3)",
              color: "rgba(200, 240, 200, 0.9)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {totalPages}
          </motion.button>
        </>
      )}

      {/* Next Button */}
      <motion.button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, rgba(100, 200, 100, 0.2) 0%, rgba(80, 180, 80, 0.1) 100%)",
          border: "1px solid rgba(200, 240, 200, 0.3)",
          color: "rgba(200, 240, 200, 0.9)",
        }}
        whileHover={currentPage < totalPages ? { scale: 1.05 } : {}}
        whileTap={currentPage < totalPages ? { scale: 0.95 } : {}}
      >
        →
      </motion.button>
    </div>
  );
}



