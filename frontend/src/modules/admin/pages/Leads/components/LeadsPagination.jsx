import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";

export const LeadsPagination = ({
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalItems
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="pagination-container">
      {/* Left: Rows per page + Range info */}
      <div className="pagination-left">
        <span className="pagination-info">
          Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalItems}</strong> leads
        </span>

        <div className="page-size-selector" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>Rows:</span>
          <CustomSelect
            size="sm"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            options={[
              { value: 10, label: "10" },
              { value: 25, label: "25" },
              { value: 50, label: "50" },
            ]}
            style={{ width: "70px", minWidth: "70px" }}
          />
        </div>
      </div>

      {/* Right: Page Buttons */}
      <div className="pagination-right">
        <button
          className="page-nav-btn"
          onClick={handlePrev}
          disabled={currentPage === 1}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          return (
            <button
              key={pageNum}
              className={`page-num-btn ${currentPage === pageNum ? "active" : ""}`}
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          className="page-nav-btn"
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
