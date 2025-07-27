import { computed } from 'vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { Model, Provider } from 'src/utils/types'
import { useObservable } from '@vueuse/rxjs'
import { db } from 'src/utils/db'
import { DexieDBURL, LitellmBaseURL } from 'src/utils/config'
import { LanguageModel, wrapLanguageModel, extractReasoningMiddleware } from 'ai'
import { AuthropicCors, FormattingReenabled } from 'src/utils/middlewares'
import { fetch } from 'src/utils/platform-api'
import { useProvidersStore } from 'src/stores/providers'

const FormattingModels = ['o1', 'o3-mini', 'o3-mini-2025-01-31']

function wrapMiddlewares(model: LanguageModel) {
  const middlewares = [extractReasoningMiddleware({ tagName: 'think' })]
  FormattingModels.includes(model.modelId) && middlewares.push(FormattingReenabled)
  model.provider.startsWith('anthropic.') && middlewares.push(AuthropicCors)
  return middlewares.length ? wrapLanguageModel({ model, middleware: middlewares }) : model
}
export function useGetModel() {
  const user = DexieDBURL ? useObservable(db.cloud.currentUser) : null
  const defaultProvider = computed(() => user?.value.isLoggedIn ? {
    type: 'openai',
    settings: { apiKey: user.value.data.apiKey, baseURL: LitellmBaseURL, compatibility: 'strict' }
  } : null)
  const { perfs } = useUserPerfsStore()
  const providersStore = useProvidersStore()
  function getProvider(provider?: Provider) {
    return provider || perfs.provider || defaultProvider.value
  }
  function getModel(model?: Model) {
    return model || perfs.model
  }
  function getSdkProvider(provider?: Provider) {
    provider = getProvider(provider)
    if (!provider) return null
    return providersStore.providerTypes.find(p => p.name === provider.type)?.constructor({
      ...provider.settings,
      fetch
    })
  }
  function getSdkModel(provider?: Provider, model?: Model, options?: Record<string, any>) {
    const sdkProvider = getSdkProvider(provider)
    if (!sdkProvider) return null
    model = getModel(model)
    if (!model) return null
    const m = sdkProvider(model.name, options) || getSdkProvider(defaultProvider.value)(model.name, options)
    return m && wrapMiddlewares(m)
  }
  return { getProvider, getModel, getSdkProvider, getSdkModel }
}
