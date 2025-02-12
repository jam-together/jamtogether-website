import { useAuthenticationStore } from '@/stores/authentication'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'

type TMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

interface IPreRequestParams {
  method?: TMethod
  endpoint?: string
  immediate?: boolean
  body?: Record<string, unknown>
}

interface IRequestParams {
  body?: Record<string, unknown>
  endpoint?: string
}

export default function useAPIRequest<T>({
  immediate = false,
  method = 'GET',
  endpoint = '/',
  body = {}
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
    body: overloadedBody,
    endpoint: overloadedEndpoint,
  }: IRequestParams = {}): Promise<T | null> {
    const bodySent = overloadedBody ?? body;
    const canSendBody = method !== "GET" && method !== "HEAD";

    try {
      isLoading.value = true
      if (!overloadedEndpoint && !endpoint) {
        throw new Error('You need to put at least one endpoint to your request.')
      }

      const response = await fetch(_buildURL(overloadedEndpoint ?? endpoint), {
        method,
        headers: {
          ...(canSendBody && { 'content-type': 'application/json' }),
          ...(authorization.value && { authorization: authorization.value }),
        },
        ...(canSendBody && {
          body: JSON.stringify(bodySent ),
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
      console.error(e);
    } finally {
      isLoading.value = false
    }
    return null
  }

  if (immediate) {
    onMounted(async () => await handleRequest())
  }

  return {
    isLoading,
    data,
    error,
    handleRequest,
    reset,
  }
}
