import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // content/<locale>/<name>.md is served at the path /<locale>/<name>.
    legal: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        // Shows a "Draft" badge on the page until the text is final.
        draft: z.boolean().default(false),
      }),
    }),
  },
})
