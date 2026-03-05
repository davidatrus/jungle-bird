import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {cancelEventAction} from './actions/cancelEventAction'

export default defineConfig({
  name: 'default',
  title: 'Jungle Bird',
  projectId: 'x77edsca',
  dataset: 'production',
  plugins: [deskTool(), visionTool()],
  schema: {types: schemaTypes},

  document: {
    actions: (prev, ctx) => {
      // Only add to Event docs
      if (ctx.schemaType === 'event') {
        return [...prev, cancelEventAction]
      }
      return prev
    },
  },
})
