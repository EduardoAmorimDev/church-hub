export type PaginatorProps = {
  className?: string
  /** Accessible name of the `nav`; defaults to "Paginação". */
  label?: string
  /** invariant: 1-based, clamped to 1…totalPages on render. */
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  page: number
  pageSize: number
  /** invariant: the current `pageSize` is always listed (default 10, 25, 50,
   * 100). */
  pageSizeOptions?: ReadonlyArray<number>
  totalItems: number
}
