// API 请求相关的组合式函数

interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  query?: Record<string, any>
}

export const useApi = () => {
  // 通用 API 请求方法
  const request = async <T>(
    endpoint: string,
    options: ApiOptions = {},
  ): Promise<ApiResponse<T>> => {
    try {
      const { method = 'GET', body, headers = {}, query } = options

      // 构建请求 URL
      let url = endpoint
      if (query) {
        const searchParams = new URLSearchParams()
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
          }
        })
        const queryString = searchParams.toString()
        if (queryString) {
          url += `?${queryString}`
        }
      }

      // 发送请求
      const response = await $fetch<ApiResponse<T>>(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      })

      return response
    }
    catch (error) {
      console.error(`API 请求失败 [${options.method || 'GET'} ${endpoint}]:`, error)

      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : '请求失败',
      }
    }
  }

  // GET 请求
  const get = <T>(endpoint: string, query?: Record<string, any>) => {
    return request<T>(endpoint, { method: 'GET', ...(query && { query }) })
  }

  // POST 请求
  const post = <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, { method: 'POST', body })
  }

  // PUT 请求
  const put = <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, { method: 'PUT', body })
  }

  // DELETE 请求
  const del = <T>(endpoint: string) => {
    return request<T>(endpoint, { method: 'DELETE' })
  }

  // PATCH 请求
  const patch = <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, { method: 'PATCH', body })
  }

  return {
    request,
    get,
    post,
    put,
    delete: del,
    patch,
  }
}

// 带缓存的 API 请求 Hook
export const useCachedApi = <T>(
  endpoint: string,
  options: ApiOptions & { key?: string } = {},
) => {
  const { key = endpoint, ...apiOptions } = options
  const api = useApi()

  return useLazyAsyncData(key, () => api.request<T>(endpoint, apiOptions), {
    server: true,
    default: () => ({
      success: false,
      data: null,
      error: null,
    } as ApiResponse<T>),
  })
}
