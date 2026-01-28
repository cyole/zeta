import type { PaginatedResponse } from '@zeta/shared'
import { useDebounceFn } from '@vueuse/core'

export interface CrudTableOptions<T, F = Record<string, unknown>> {
  endpoint: string
  initialFilters?: Partial<F>
  searchDebounce?: number
  transformResponse?: (data: PaginatedResponse<T>) => PaginatedResponse<T>
}

export interface CrudTableFilters {
  search?: string
  [key: string]: unknown
}

export function useCrudTable<T extends { id: string }, F extends CrudTableFilters = CrudTableFilters>(
  options: CrudTableOptions<T, F>,
) {
  const {
    endpoint,
    initialFilters = {} as Partial<F>,
    searchDebounce = 300,
    transformResponse,
  } = options

  const api = useApi()
  const toast = useToast()

  // State
  const loading = ref(false)
  const items = ref<T[]>([]) as Ref<T[]>
  const selectedItems = ref<T[]>([]) as Ref<T[]>
  const filters = reactive<F>({ ...initialFilters } as F)

  // Pagination
  const pagination = usePagination()

  // Search with debounce
  const debouncedSearch = useDebounceFn(() => {
    pagination.setPage(1)
    fetchItems()
  }, searchDebounce)

  // Build query params
  function buildQueryParams(): URLSearchParams {
    const params = new URLSearchParams({
      page: pagination.page.value.toString(),
      limit: pagination.pageSize.value.toString(),
    })

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        }
        else {
          params.set(key, String(value))
        }
      }
    })

    return params
  }

  // Fetch items
  async function fetchItems() {
    loading.value = true
    try {
      const params = buildQueryParams()
      let data = await api.get<PaginatedResponse<T>>(`${endpoint}?${params}`)

      if (transformResponse) {
        data = transformResponse(data)
      }

      items.value = data.items
      pagination.setTotal(data.meta.total)
    }
    catch (error) {
      console.error('Failed to fetch items', error)
    }
    finally {
      loading.value = false
    }
  }

  // Create item
  async function createItem(data: Partial<T>): Promise<T | null> {
    try {
      const result = await api.post<T>(endpoint, data)
      toast.add({ title: '创建成功', color: 'success' })
      await fetchItems()
      return result
    }
    catch (error: any) {
      toast.add({ title: '创建失败', description: error.message, color: 'error' })
      return null
    }
  }

  // Update item
  async function updateItem(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const result = await api.patch<T>(`${endpoint}/${id}`, data)
      toast.add({ title: '更新成功', color: 'success' })
      await fetchItems()
      return result
    }
    catch (error: any) {
      toast.add({ title: '更新失败', description: error.message, color: 'error' })
      return null
    }
  }

  // Delete item
  async function deleteItem(id: string, confirm = true): Promise<boolean> {
    // eslint-disable-next-line no-alert
    if (confirm && !window.confirm('确定要删除吗？')) {
      return false
    }

    try {
      await api.del(`${endpoint}/${id}`)
      toast.add({ title: '删除成功', color: 'success' })
      await fetchItems()
      return true
    }
    catch (error: any) {
      toast.add({ title: '删除失败', description: error.message, color: 'error' })
      return false
    }
  }

  // Batch delete
  async function batchDelete(): Promise<boolean> {
    if (selectedItems.value.length === 0) {
      toast.add({ title: '请先选择要删除的项', color: 'warning' })
      return false
    }

    // eslint-disable-next-line no-alert
    if (!window.confirm(`确定要删除选中的 ${selectedItems.value.length} 项吗？`)) {
      return false
    }

    try {
      await api.del(`${endpoint}/batch`, {
        body: JSON.stringify({ userIds: selectedItems.value.map(i => i.id) }),
      })
      toast.add({ title: '批量删除成功', color: 'success' })
      selectedItems.value = []
      await fetchItems()
      return true
    }
    catch (error: any) {
      toast.add({ title: '批量删除失败', description: error.message, color: 'error' })
      return false
    }
  }

  // Selection
  function toggleSelection(item: T) {
    const index = selectedItems.value.findIndex(i => i.id === item.id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }
    else {
      selectedItems.value.push(item)
    }
  }

  function toggleSelectAll() {
    if (selectedItems.value.length === items.value.length) {
      selectedItems.value = []
    }
    else {
      selectedItems.value = [...items.value]
    }
  }

  function clearSelection() {
    selectedItems.value = []
  }

  const isSelected = (item: T) => selectedItems.value.some(i => i.id === item.id)
  const isAllSelected = computed(() =>
    items.value.length > 0 && selectedItems.value.length === items.value.length,
  )
  const isSomeSelected = computed(() =>
    selectedItems.value.length > 0 && selectedItems.value.length < items.value.length,
  )

  // Filter management
  function setFilter<K extends keyof F>(key: K, value: F[K]) {
    (filters as any)[key] = value
    pagination.setPage(1)
    fetchItems()
  }

  function resetFilters() {
    Object.keys(filters).forEach((key) => {
      delete (filters as any)[key]
    })
    Object.assign(filters, initialFilters)
    pagination.reset()
    fetchItems()
  }

  // Watch for pagination changes
  watch([() => pagination.page.value, () => pagination.pageSize.value], () => {
    fetchItems()
  }, { immediate: false })

  return {
    // State
    loading: readonly(loading),
    items,
    selectedItems,
    filters,
    pagination,
    // CRUD operations
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    batchDelete,
    // Selection
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected,
    // Filters
    setFilter,
    resetFilters,
    debouncedSearch,
  }
}
