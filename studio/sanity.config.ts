import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {cancelEventAction} from './actions/cancelEventAction'
import {deskStructure} from './deskStructure'

export default defineConfig({
  name: 'default',
  title: 'Jungle Bird',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'x77edsca',

  plugins: [deskTool({structure: deskStructure}), visionTool()],

  schema: {types: schemaTypes},

  document: {
    actions: (prev, ctx) => {
      if (ctx.schemaType === 'event') {
        return [...prev, cancelEventAction]
      }
      return prev
    },
  },
})
