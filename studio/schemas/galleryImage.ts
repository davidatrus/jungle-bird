// /studio/schemas/galleryImage.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'galleryImage',
  title: 'Gallery Image',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
      description:
        'Short description. Used as on-screen caption and for accessibility. Leave empty if not needed.',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers show first (1, 2, 3…).',
    }),
  ],
  orderings: [{name: 'orderAsc', title: 'Order Asc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'caption', media: 'image', order: 'order'},
    prepare({title, media, order}) {
      return {
        title: title || 'Image',
        subtitle: typeof order === 'number' ? `#${order}` : 'Unordered',
        media,
      }
    },
  },
})
