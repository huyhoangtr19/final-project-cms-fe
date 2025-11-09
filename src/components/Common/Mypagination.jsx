// Function Name : Pagination
// Created date :  25/7/24             by :  NgVinh
// Updated date :
import { range } from "lodash";
import React, { useMemo } from "react";
import { Label, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import i18n from "../../i18n";

const MyPagination = ({
  page,
  rowPerPage,
  totalRecord,
  onClick,
  totalPage,
  onPrevious,
  onNext,
}) => {
  const totalPages = useMemo(() => {
    return totalPage ? totalPage : Math.ceil(totalRecord / rowPerPage);
  }, [totalRecord]);
  const paginationItems = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );
  const DOTS = "...";
  const paginationRange = useMemo(() => {
    const totalPageCount = totalPages;
    const totalPageNumbers = 1 + 5;

    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount + 1);
    }
    const leftSiblingIndex = Math.max(page - 1, 1);
    const rightSiblingIndex = Math.min(page + 1, totalPageCount);
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * 1;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * 1;
      let rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount
      );
      return [firstPageIndex, DOTS, ...rightRange, lastPageIndex];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
  }, [totalPages, page]);
  return (
    <div
      className="my-pagination"
      style={{ display: totalRecord !== 0 ? "flex" : "none" }}
    >
      <Label className="pagination-total-record">
        {i18n.t("total")} : {totalRecord}
      </Label>
      <Pagination
        aria-label="Page navigation example"
        style={{ display: "flex", gap: 5, marginBottom: 0 }}
      >
        <PaginationItem>
          <PaginationLink
            style={{ borderRadius: 5 }}
            onClick={() => onPrevious()}
          >
            <i className="mdi mdi-chevron-left" />
          </PaginationLink>
        </PaginationItem>
        {paginationRange.length ? (
          paginationRange.map((item, index) => (
            <PaginationItem key={index} active={page === item}>
              <PaginationLink
                style={{ borderRadius: 5 }}
                onClick={() => item !== "..." && onClick(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ))
        ) : (
          <PaginationItem active={page === 1}>
            <PaginationLink
              style={{ borderRadius: 5 }}
              onClick={() => onClick(1)}
            >
              1
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink style={{ borderRadius: 5 }} onClick={() => onNext()}>
            <i className="mdi mdi-chevron-right" />
          </PaginationLink>
        </PaginationItem>
      </Pagination>
    </div>
  );
};
export default MyPagination;
