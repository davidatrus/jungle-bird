//studio/schemas/faq.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'venueKey',
      title: 'Venue',
      type: 'string',
      initialValue: 'jungle_bird',
      options: {
        list: [
          {title: 'Jungle Bird', value: 'jungle_bird'},
          {title: 'Prohibition', value: 'prohibition'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'question', type: 'string', title: 'Question'}),
    defineField({name: 'answer', type: 'text', title: 'Answer'}),
    defineField({name: 'order', type: 'number', title: 'Order'}),
  ],
})
