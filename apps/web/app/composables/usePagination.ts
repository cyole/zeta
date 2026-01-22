export interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    initialPage = 1,
    initialPageSize = 20,
    pageSizeOptions = [10, 20, 50, 100],
  } = options

  const page = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

  const startIndex = computed(() => {
    if (total.value === 0)
      return 0
    return (page.value - 1) * pageSize.value + 1
  })

  const endIndex = computed(() => {
    return Math.min(page.value * pageSize.value, total.value)
  })

  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPrevPage = computed(() => page.value > 1)

  function setPage(newPage: number) {
    page.value = Math.max(1, Math.min(newPage, totalPages.value || 1))
  }

  function setPageSize(newSize: number) {
    pageSize.value = newSize
    page.value = 1 // Reset to first page
  }

  function setTotal(newTotal: number) {
    total.value = newTotal
  }

  function reset() {
    page.value = initialPage
    pageSize.value = initialPageSize
    total.value = 0
  }

  return {
    // State
    page,
    pageSize,
    total,
    totalPages,
    pageSizeOptions,
    // Computed
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    // Actions
    setPage,
    setPageSize,
    setTotal,
    reset,
  }
}
