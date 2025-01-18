import { defineStore } from 'pinia'
import { type Ref, ref, watch } from 'vue'

export const useWebsocketStore = defineStore('websocket', () => {
  const websocket: Ref<WebSocket | null> = ref(null)
  const identityId: Ref<string | null> = ref(null)
  const keepAliveTimeout: Ref<number | null> = ref(null)
  const keepAliveInterval: Ref<number | null> = ref(null)

  // time until the next keep alive check
  const KEEP_ALIVE_CHECK = 3e4
  const KEEP_ALIVE_TIMEOUT = 3e4

  const initSocket = (id: string) => {
    identityId.value = id
    connect()
  }

  watch(websocket, (ws) => {
    if (!ws) return
    ws.onopen = () => {
      if (keepAliveInterval.value) {
        clearInterval(keepAliveInterval.value)
      }

      keepAliveInterval.value = setInterval(ping, KEEP_ALIVE_CHECK)
      _log('connected to ws !')
    }
    ws.onclose = () => {
      _log('Connection with the websocket lost.')
    }

    // keep alive connection
    ws.addEventListener('message', (event) => {
      const message = event.data
      if (message === '__pong__') {
        pong()
        return
      }
    })
  })

  const send = (data: string | Record<string, unknown>) => {
    let message: string
    if (typeof data !== 'string') {
      message = JSON.stringify(data)
    } else {
      message = data
    }

    if (websocket.value?.readyState === WebSocket.OPEN) {
      websocket.value.send(message)
    }
  }

  const connect = () => {
    websocket.value = new WebSocket(`${import.meta.env.VITE_WSS}/` + identityId.value)
  }

  const close = () => {
    websocket.value?.close()
    _log('websocket was closed normally')
  }

  const ping = () => {
    send('__ping__')
    _log('keep alive - waiting for a response...')

    keepAliveTimeout.value = setTimeout(() => {
      _log('Connection with the socket lost, reconnecting...')
      connect()
    }, KEEP_ALIVE_TIMEOUT)
  }

  const pong = () => {
    if (keepAliveTimeout.value) {
      clearTimeout(keepAliveTimeout.value)
      _log('keep alive - response received !')
    }
  }

  const _log = (message: string) => {
    console.log(`[Websocket] ${identityId.value}: ${message}`)
  }

  return {
    initSocket,
    close,
    websocket,
  }
})
