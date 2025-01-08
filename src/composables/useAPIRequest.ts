import { useAuthenticationStore } from '@/stores/authentication'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'

type TMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface IPreRequestParams {
  method?: TMethod
  endpoint?: string
  immediate?: boolean
}

interface IRequestParams {
  body?: Record<string, unknown>
  endpoint?: string
}

export default function useAPIRequest<T>({
  immediate = false,
  method = 'GET',
  endpoint = '/',
}: IPreRequestParams = {}) {
  const isLoading = ref<boolean>(false)
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const { authorization } = storeToRefs(useAuthenticationStore())

  function _buildURL(endpoint: string) {
    let url = ''
    if (!endpoint.startsWith('/')) {
      url += '/'
    }
    url += endpoint
    return import.meta.env.VITE_API_URL + url
  }

  function reset() {
    isLoading.value = false
    data.value = null
    error.value = null
  }

  async function handleRequest({
    body,
    endpoint: overloadedEndpoint,
  }: IRequestParams = {}): Promise<T | null> {
    try {
      isLoading.value = true
      if (!overloadedEndpoint && !endpoint) {
        throw new Error('You need to put at least one endpoint to your request.')
      }
      const response = await fetch(_buildURL(overloadedEndpoint ?? endpoint), {
        method,
        headers: {
          ...(body && { 'content-type': 'application/json' }),
          ...(authorization.value && { authorization: authorization.value }),
        },
        ...(body && {
          body: JSON.stringify(body),
        }),
      })
      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData?.message ?? `HTTP error - ${response.statusText}`)
      }

      data.value = resData
      return resData
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
    return null
  }

  onMounted(async () => {
    if (immediate) {
      await handleRequest()
    }
  })

  return {
    isLoading,
    data,
    error,
    handleRequest,
    reset,
  }
}
