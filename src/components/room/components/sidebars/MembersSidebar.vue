<template>
  <base-dynamic-sidebar
    :title="`${$t('room.components.sidebars.membersSidebar.title')} (${room?.members.length})`"
    @close="emit('close')"
    :is-shown="isShown"
  >
    <ul>
      <li v-for="member in room?.members" :key="member.id">
        <span :style="generateRandomStyle()" class="logo">{{
          member.displayName.slice(0, 1)
        }}</span>
        <span class="display-name">
          <span v-if="!edit">{{ member.displayName }}</span>
          <input v-else v-model="nickname" />

          <span v-if="!edit" class="connection-status">{{
            member.isConnected ? 'Connecté' : 'Deconnecté'
          }}</span>
        </span>
        <button
          @click="toggleEdit"
          v-if="member.id === me?.clientId"
          class="icon toggle-edit"
          :class="!edit ? 'icon-edit' : 'icon-validate'"
        />

        <span v-if="!edit" class="owner">{{
          $t('room.components.sidebars.membersSidebar.owner')
        }}</span>
      </li>
    </ul>
  </base-dynamic-sidebar>
</template>

<script lang="ts" setup>
import BaseDynamicSidebar from '@/components/ui/BaseDynamicSidebar.vue'
import useAPIRequest from '@/composables/useAPIRequest'
import { useAuthenticationStore } from '@/stores/authentication'
import useConnectedRoom from '@/stores/connectedRoom'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

defineProps<{
  isShown: boolean
}>()

const { me } = storeToRefs(useAuthenticationStore())
const { room } = storeToRefs(useConnectedRoom())
const emit = defineEmits(['close'])

const nickname = ref<string>('')
const edit = ref<boolean>(false)

const { error, handleRequest } = useAPIRequest<{ success: true }>({
  method: 'POST',
})

const toggleEdit = () => {
  edit.value = !edit.value
}

const changeNickname = async () => {
  await handleRequest({
    endpoint: `/rooms/actions/${room.value.id}/change-nickname`,
    body: {
      newNickname: nickname.value,
    },
  })

  if (error.value) {
    window.room.modal.open({
      type: 'ERROR',
      title: 'Oups',
      description: error.value.message,
    })
    return
  }
}

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

watch(edit, (value, oldValue) => {
  if (value !== oldValue && value === false && oldValue !== undefined) {
    changeNickname()
  }
})
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

    & > span.display-name {
      display: flex;
      flex-direction: column;

      & > span {
        display: block;
      }

      & > span.connection-status {
        font-size: 0.9em;
        color: $gray-2;
      }

      & > input {
        height: 5px;
        padding: 1em 0.5em;
        border: 1px solid $gray-1;
      }
    }

    & > button.toggle-edit {
      padding: 0.5em;
      border-radius: 100px;

      &::before {
        position: unset;
        font-size: 1.2em;
      }
      &.icon-validate::before {
        @include icon('check');
      }
      &.icon-edit::before {
        @include icon('pencil');
      }
    }

    & > span.owner {
      background-color: $secondary-200;
      color: $gray-3;
      padding: 0.4em 0.8em;
      border-radius: 100px;

      font-size: 0.9em;

      font-family: 'publicsans-bold', sans-serif;
    }

    &:not(:last-of-type) {
      border-bottom: 1px solid $gray-2;
    }
  }
}
</style>
