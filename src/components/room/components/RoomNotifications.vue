<template>
  <div
    v-show="isShown"
    class="room-notification icon"
    role="banner"
    :class="data?.type.toLowerCase()"
    ref="modalRef"
  >
    <h3>{{ data?.title }}</h3>
    <h4 v-if="data?.description">{{ data?.description }}</h4>
    <span @click="closeModal" class="close">&times;</span>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

type TNotificationType = 'ERROR' | 'SUCCESS'
export interface INotificationParams {
  title: string
  type: TNotificationType
  description?: string
}

const NOTIFICATION_TIMEOUT = ref<number>(3e3) // 3 seconds

const isShown = ref<boolean>(false)
const timeoutId = ref<number>(0)
const data = ref<INotificationParams | null>(null)
const modalRef = ref<HTMLElement | null>(null)

window.room = {
  modal: {
    open: (notification: INotificationParams): void => {
      if (timeoutId.value) {
        clearTimeout(timeoutId.value)
      }
      timeoutId.value = setTimeout(closeModal, NOTIFICATION_TIMEOUT.value)
      isShown.value = true
      data.value = notification
    },
  },
}

const closeModal = () => {
  clearTimeout(timeoutId.value)
  if (modalRef.value) {
    modalRef.value?.classList.add('close')
    setTimeout(() => {
      modalRef.value?.classList.remove('close')
      isShown.value = false
    }, 500 / 2)
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/components/room/room-notifications.scss';
</style>
