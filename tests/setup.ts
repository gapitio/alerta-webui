import {vi} from 'vitest'

// Ignore all CSS imports in tests
vi.mock('.css', () => ({}))
vi.mock('vuetify/styles', () => ({}))
