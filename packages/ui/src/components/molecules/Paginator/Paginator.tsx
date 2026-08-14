'use client'

import { IconButton } from '@church/ui/atoms/IconButton'
import { Icon } from '@church/ui/atoms/Icon'
import { Typography } from '@church/ui/atoms/Typography'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { PageJumpField, PageSizeSelect } from './components'
import { pageButton, paginator } from './Paginator.styles'
import { PaginatorProps } from './Paginator.types'

const DEFAULT_PAGE_SIZE_OPTIONS: ReadonlyArray<number> = [10, 20, 50]
const MIN_PAGES_FOR_JUMP = 6
const PAGE_WINDOW = 3

const isPositiveInteger = (value: number) =>
  Number.isInteger(value) && value > 0

const countTotalPages = (totalItems: number, pageSize: number) =>
  isPositiveInteger(pageSize) && totalItems > 0
    ? Math.ceil(totalItems / pageSize)
    : 0

const clampPage = (page: number, totalPages: number) => {
  if (totalPages === 0) return 0

  const requested = Number.isInteger(page) ? page : 1

  return Math.min(Math.max(requested, 1), totalPages)
}

const pageWindow = (currentPage: number, totalPages: number) => {
  const size = Math.min(PAGE_WINDOW, totalPages)
  const first = Math.min(
    Math.max(currentPage - Math.floor(PAGE_WINDOW / 2), 1),
    totalPages - size + 1
  )

  return Array.from({ length: size }, (_, index) => first + index)
}

const formatRange = (
  currentPage: number,
  pageSize: number,
  totalItems: number
) => {
  if (currentPage === 0) return '0 itens'

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)
  const noun = totalItems === 1 ? 'item' : 'itens'

  return `${start}-${end} de ${totalItems} ${noun}`
}

const sizeOptions = (options: ReadonlyArray<number>, pageSize: number) =>
  Array.from(
    new Set(isPositiveInteger(pageSize) ? [...options, pageSize] : options)
  ).sort((a, b) => a - b)

export const Paginator = ({
  className,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  totalItems
}: PaginatorProps) => {
  const slots = paginator()
  const items = Number.isFinite(totalItems)
    ? Math.max(Math.floor(totalItems), 0)
    : 0
  const totalPages = countTotalPages(items, pageSize)
  const currentPage = clampPage(page, totalPages)
  const atStart = currentPage <= 1
  const atEnd = currentPage >= totalPages

  const goTo = (target: number) => {
    if (target === currentPage || target < 1 || target > totalPages) return
    onPageChange(target)
  }

  const handlePageSizeChange = (nextPageSize: number) => {
    onPageSizeChange(nextPageSize)
    onPageChange(1)
  }

  const navButton = (
    label: string,
    icon: 'first_page' | 'chevron_left' | 'chevron_right' | 'last_page',
    target: number,
    disabled: boolean
  ) => (
    <IconButton
      aria-label={label}
      color="neutral"
      disabled={disabled}
      onClick={() => goTo(target)}
      size="small"
      type="button"
      variant="ghost"
    >
      <Icon disabled={disabled} name={icon} />
    </IconButton>
  )

  return (
    <nav aria-label="Paginação" className={twMerge(slots.root(), className)}>
      <div className={slots.start()}>
        <PageSizeSelect
          onChange={handlePageSizeChange}
          options={sizeOptions(pageSizeOptions, pageSize)}
          value={pageSize}
        />
        <Typography className={slots.supportingText()} variant="p3">
          {formatRange(currentPage, pageSize, items)}
        </Typography>
      </div>
      <div className={slots.end()}>
        <div className={slots.controls()}>
          <div className={slots.cluster()}>
            {navButton('Primeira página', 'first_page', 1, atStart)}
            {navButton(
              'Página anterior',
              'chevron_left',
              currentPage - 1,
              atStart
            )}
          </div>
          {totalPages > 0 && (
            <div className={slots.cluster()}>
              {pageWindow(currentPage, totalPages).map(pageNumber => {
                const isCurrent = pageNumber === currentPage

                return (
                  <button
                    key={pageNumber}
                    aria-current={isCurrent ? 'page' : undefined}
                    aria-label={`Página ${pageNumber}`}
                    className={pageButton({ current: isCurrent })}
                    onClick={() => goTo(pageNumber)}
                    type="button"
                  >
                    <Typography as="span" variant="f3">
                      {pageNumber}
                    </Typography>
                  </button>
                )
              })}
            </div>
          )}
          <div className={slots.cluster()}>
            {navButton(
              'Próxima página',
              'chevron_right',
              currentPage + 1,
              atEnd
            )}
            {navButton('Última página', 'last_page', totalPages, atEnd)}
          </div>
        </div>
        {totalPages >= MIN_PAGES_FOR_JUMP && (
          <PageJumpField
            currentPage={currentPage}
            onJump={goTo}
            totalPages={totalPages}
          />
        )}
      </div>
    </nav>
  )
}
