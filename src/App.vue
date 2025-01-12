<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import HomeView from './components/HomeView.vue';
import ConfigView from './components/ConfigView.vue';
const route = ref('')
const enterAction = ref({})

onMounted(() => {
  window.utools.onPluginEnter((action) => {
    route.value = action.code
    console.log("route", route.value);

    enterAction.value = action
  })
  window.utools.onPluginOut((isKill) => {
    route.value = ''
  })
})
</script>

<template>
  <template v-if="route === 'commit'">
    <HomeView :enterAction="enterAction" />
  </template>
  <template v-if="route === 'config'">
    <ConfigView :enterAction="enterAction" />
  </template>
</template>