import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'menu',
  title: 'Menu',
  type: 'document',
  fields: [
    defineField({
      name: 'menuPdf',
      title: 'Menu PDF',
      type: 'file',
      options: {storeOriginalFilename: true},
      description: 'Upload a single combined PDF of the current menu.',
      validation: (Rule) => Rule.required(),
      // Restrict to PDFs in the file picker
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt / Description (for accessibility)',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'version',
      title: 'Version / Label',
      type: 'string',
      description: 'e.g., “Fall 2025”',
    }),
    defineField({
      name: 'updated',
      title: 'Updated On',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    // Nice-to-have fallback if a venue wants thumbnails on the page
    defineField({
      name: 'pageImages',
      title: 'Optional page images',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
    }),
  ],
})
