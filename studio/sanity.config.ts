import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {cancelEventAction} from './actions/cancelEventAction'
import {deskStructure} from './deskStructure'

const venueTemplateTypes = ['settings', 'menu', 'galleryImage', 'faq', 'event']

export default defineConfig({
  name: 'default',
  title: 'Jungle Bird',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'x77edsca',

  plugins: [deskTool({structure: deskStructure}), visionTool()],

  schema: {
    types: schemaTypes,
    templates: (prev) => {
      const filtered = prev.filter(
        (template) => !venueTemplateTypes.includes(template.schemaType || ''),
      )

      const venueTemplates = venueTemplateTypes.flatMap((schemaType) => [
        {
          id: `${schemaType}-jungle-bird`,
          title: `Jungle Bird ${schemaType}`,
          schemaType,
          value: {
            venueKey: 'jungle_bird',
          },
        },
        {
          id: `${schemaType}-prohibition`,
          title: `Prohibition ${schemaType}`,
          schemaType,
          value: {
            venueKey: 'prohibition',
          },
        },
      ])

      return [...filtered, ...venueTemplates]
    },
  },

  document: {
    actions: (prev, ctx) => {
      if (ctx.schemaType === 'event') {
        return [...prev, cancelEventAction]
      }
      return prev
    },
  },
})
