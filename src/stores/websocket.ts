import { defineStore } from 'pinia'
import { type Ref, ref, watch } from 'vue'

export const useWebsocketStore = defineStore('websocket', () => {

  const websocket: Ref<WebSocket|null> = ref(null);
  const identityId: Ref<string|null> = ref(null);

  const initSocket = (id: string) => {
    identityId.value = id;
    websocket.value = new WebSocket(`${import.meta.env.VITE_WSS}/`+identityId.value);
  }

  watch(websocket, ws => {
    if(!ws) return;
    ws.onopen = () => {
      _log('connected to ws !');
    }
  });

  const close = () => {
    websocket.value?.close();
  }

  const _log = (message: string) => {
    console.log(`[Websocket] ${identityId.value}: ${message}`)
  }

  return {
    initSocket,
    close,
    websocket
  }

});
