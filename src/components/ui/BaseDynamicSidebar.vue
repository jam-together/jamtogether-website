<template>
  <aside v-show="isShown">
    <div ref="sidebarRef" class="left">
      <span @click="close" class="icon close" />

      <h2>{{ title }}</h2>
      <slot />
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

defineProps({
  isShown: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})

const sidebarRef = ref<HTMLElement | null>(null)

const emit = defineEmits(['close'])

const close = () => {
  sidebarRef.value?.classList.add('close')
  setTimeout(() => {
    sidebarRef.value?.classList.remove('close')
    emit('close')
  }, 500 / 2)
}

// const clickingOutside = (event: Event) => {
//   triggerWhenFound(event.target as HTMLElement, sidebarRef.value!, (isFound: boolean) => {
//     if (!isFound) {
//       close()
//     }
//   })
// }

// onMounted(() => {
//   window.addEventListener('click', clickingOutside)
// })
// onBeforeUnmount(() => {
//   window.removeEventListener('click', clickingOutside)
// })
</script>

<style lang="scss" scoped>
aside {
  position: fixed;
  top: 0;
  left: 0;

  width: 100%;
  height: 100vh;

  z-index: 99999; // belek

  background-color: rgba(0, 0, 0, 0.5);

  & > div.left {
    position: fixed;
    top: 0;
    left: 0;

    width: 80%;
    height: 100vh;

    background-color: $gray-3;

    padding-left: 1em;
    padding-right: 3em;

    animation: 0.5s sidebar-open forwards;

    &.close {
      animation: 0.5s sidebar-close forwards;
    }

    & > h2 {
      margin-top: 1em;
      margin-bottom: 1em;
    }

    & > span.close {
      position: absolute;
      top: 0.5em;
      right: 1.7em;

      cursor: pointer;

      font-size: 3em;

      &::before {
        @include icon('close');
      }
    }
  }

  @keyframes sidebar-open {
    from {
      left: -100em;
    }
    to {
      left: 0;
    }
  }
  @keyframes sidebar-close {
    from {
      left: 0;
    }
    to {
      left: -100em;
    }
  }
}
</style>
