<template>
  <base-dynamic-sidebar
    :title="`Membres (${members.length})`"
    @close="emit('close')"
    :is-shown="isShown"
    :style="{ '--member-size': members.length }"
  >
    <ul>
      <li v-for="member in members" :key="member.id">
        <span :style="generateRandomStyle()" class="logo">{{
          member.displayName.slice(0, 1)
        }}</span>
        <span class="display-name">{{ member.displayName }}</span>
      </li>
    </ul>
  </base-dynamic-sidebar>
</template>

<script lang="ts" setup>
import BaseDynamicSidebar from '@/components/ui/BaseDynamicSidebar.vue'
import type { IRoomMember } from '@/utils/types'

defineProps<{
  isShown: boolean
  members: IRoomMember[]
}>()

const emit = defineEmits(['close'])

const generateRandomStyle = () => {
  const randomPastel = () => {
    const randomValue = () => Math.floor(Math.random() * 156) + 100
    return [randomValue(), randomValue(), randomValue()]
  }
  const adjustColor = (rgb: number[], factor: number = 0.7) => {
    return rgb.map((c) => Math.floor(c * factor)).join(', ')
  }

  const color1 = randomPastel()
  const textColor = adjustColor(color1, 0.5)

  return {
    color: `rgb(${textColor})`,
    backgroundColor: `rgb(${color1.join(',')})`,
  }
}
</script>

<style lang="scss" scoped>
ul {
  max-height: 89vh;
  overflow: auto;

  & > li {
    padding: 2em 0;
    padding-right: 1em;

    display: flex;
    align-items: center;
    gap: 1em;

    & > span {
      display: block;
    }

    & > span.logo {
      text-align: center;
      padding: 1em 1.4em;
      border-radius: 100px;

      font-family: 'poppins-bold', sans-serif;
    }

    &:not(:last-of-type) {
      border-bottom: 1px solid $gray-2;
    }
  }
}
</style>
