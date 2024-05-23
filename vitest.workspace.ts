import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'packages/*',
  {
    test: {
      setupFiles: ['@vitest/web-worker'],
    },
  },
]) 