import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const SalesPagination = ({
  currentPage,
  setCurrentPage,
  pageSize = 10,
  totalItems,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Generate page numbers with ellipsis when pages > 5
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage, "...", totalPages];
  };

  if (totalItems === 0) return null;

  return (
    <div className="sales-pagination-wrapper">
      <style>{`
        .sales-pagination-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 16px;
          margin-bottom: 12px;
          box-sizing: border-box;
          width: 100%;
        }

        .sales-pag-controls {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #ece7dc;
          border-radius: 12px;
          padding: 6px 10px;
          box-shadow: 0 2px 8px rgba(20, 20, 22, 0.04);
        }

        .sales-pag-btn {
          min-width: 34px;
          height: 34px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e6e0d2;
          border-radius: 8px;
          background: #ffffff;
          color: #141416;
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .sales-pag-btn:hover:not(:disabled) {
          background: #fbf9f4;
          border-color: #dcd4c3;
          color: #ff3b19;
        }

        .sales-pag-btn.active {
          background: #ff3b19;
          border-color: #ff3b19;
          color: #ffffff;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(255, 59, 25, 0.35);
        }

        .sales-pag-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          background: #fbf9f4;
          border-color: #ece7dc;
        }

        .sales-pag-ellipsis {
          min-width: 24px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.825rem;
          color: #94a3b8;
          font-weight: 700;
        }
      `}</style>

      {/* Only Keep < 1 2 > Buttons */}
      <div className="sales-pag-controls">
        <button
          type="button"
          className="sales-pag-btn"
          onClick={handlePrev}
          disabled={currentPage === 1}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((num, i) => {
          if (num === "...") {
            return (
              <span key={`dots-${i}`} className="sales-pag-ellipsis">
                ...
              </span>
            );
          }
          return (
            <button
              key={`page-${num}`}
              type="button"
              className={`sales-pag-btn ${currentPage === num ? "active" : ""}`}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </button>
          );
        })}

        <button
          type="button"
          className="sales-pag-btn"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
