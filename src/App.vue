<template>
  <router-view />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFirstVisit } from './composables/first-visit'
import { useSetTheme } from './composables/set-theme'
import { useSubscriptionNotify } from './composables/subscription-notify'
import { onMounted } from 'vue'
import { checkUpdate, ready } from './utils/update'

defineOptions({
  name: 'App'
})

useSetTheme()
useFirstVisit()
useSubscriptionNotify()

const router = useRouter()
router.afterEach(to => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 嘉谷域 AI工作台`
  }
})

onMounted(() => {
  ready()
  checkUpdate()
})

</script>
