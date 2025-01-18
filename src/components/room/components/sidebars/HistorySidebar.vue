<template>
  <base-dynamic-sidebar
    :title="`${$t('room.components.sidebars.historySidebar.title')} (${sortedHistory.length})`"
    @close="emit('close')"
    :is-shown="isShown"
  >
    <ul>
      <li
        class="icon type"
        :class="line.type.toLowerCase()"
        v-for="(line, index) in sortedHistory"
        :key="index"
      >
        <span>
          {{ useRoomEvents().getMessageType(line.type, line.data) }}
        </span>
        <span class="sent-at">{{ formatDate(line.date) }}</span>
      </li>
    </ul>
  </base-dynamic-sidebar>
</template>

<script lang="ts" setup>
import BaseDynamicSidebar from '@/components/ui/BaseDynamicSidebar.vue'
import useRoomEvents from '@/composables/room/useRoomEvents'
import useConnectedRoom from '@/stores/connectedRoom'
import { formatDate } from '@/utils/dateUtils'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const { room } = storeToRefs(useConnectedRoom())

defineProps<{
  isShown: boolean
}>()

const sortedHistory = computed(() =>
  [...room.value!.history]
    .filter(({ type }) => {
      return !['DISCONNECTED'].includes(type)
    })
    .reverse(),
)

const emit = defineEmits(['close'])
</script>

<style lang="scss" scoped>
ul {
  max-height: 89vh;
  overflow: auto;

  & > li {
    padding: 2em 0;
    padding-left: 3em;
    padding-right: 1em;
    position: relative;

    &.icon {
      &::before {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);

        font-size: 2em;
      }
      &.member_joined::before,
      &.member_leaved::before {
        @include icon('account');
      }

      &.music_played::before,
      &.music_paused::before {
        @include icon('play-pause');
      }

      &.music_switched::before,
      &.music_added::before,
      &.music_removed::before {
        @include icon('music-circle');
      }
    }

    &:not(:last-of-type) {
      border-bottom: 1px solid $gray-2;
    }

    & > span.sent-at {
      display: block;
      margin-top: 0.3em;
      color: $gray-2;
    }
  }
}
</style>
