<template>
  <div
      role="graphics-object"
      class="spin"
  />
</template>

<script setup lang="ts">

import {computed, toRefs} from "vue";

const props = defineProps({
  size: {
    default: 10,
    type: Number
  },
  thickness: {
    default: 4,
    type: Number
  },
  color: {
    type: String
  }
});
const { size, thickness, color } = toRefs(props);

const properties = {
  size: computed(() => `${size.value}em`).value,
  thickness: computed(() => `${thickness.value}px`).value,
  thicknessSize: computed(() => `${size.value}em`).value,
  color: computed(() => color.value ?? "#ffff" ).value
}
</script>

<style lang="scss" scoped>
.spin {
  width: v-bind("properties.size");
  height: v-bind("properties.size");
  border-radius: 50%;
  animation: rotation 1s linear infinite;

  margin: auto;

  display: block;
  position: relative;

  &::after {
    content: "";
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: v-bind("properties.thicknessSize");
    height: v-bind("properties.thicknessSize");
    border-radius: 50%;
    border: v-bind("properties.thickness") solid transparent;


    border-bottom-color: v-bind("properties.color");
  }
}


@keyframes rotation {
  0% {
    transform: rotate(0deg)
  }

  100% {
    transform: rotate(360deg)
  }
}
</style>
