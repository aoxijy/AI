import { Ref, watchEffect } from 'vue'

export function useSetTitle(title: Ref<string>) {
  watchEffect(() => {
    if (!title.value) return
    document.title = `${title.value} - 嘉谷域 AI工作台`
  })
}
