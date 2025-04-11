import { Store } from './src/plugins/store/types'

declare module 'vue' {
    interface ComponentCustomProperties {
        $store: Store
    }
}