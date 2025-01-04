import { defineStore } from 'pinia'
import { type Ref, ref } from 'vue'

export const useWebsocketStore = defineStore('websocket', () => {

  const websocket: Ref<WebSocket|null> = ref(null);
  const identityId: Ref<string|null> = ref(null);

  const initSocket = (id: string) => {
    identityId.value = id;
    websocket.value = new WebSocket(`${import.meta.env.VITE_WSS}/`+identityId.value);
  }

  return {
    initSocket,
    websocket
  }

});
