import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({name: 'address', type: 'string', title: 'Address'}),
    defineField({name: 'email', type: 'string', title: 'Email'}),
    defineField({
      name: 'phone',
      type: 'string',
      title: 'Phone',
      description: 'Main phone number shown on Contact/Find Us/Footer',
      validation: (Rule) =>
        Rule.custom((val: string | undefined) => {
          if (!val) return true // allow empty (optional field)
          return /^[0-9+().\-\s]{7,20}$/.test(val)
            ? true
            : 'Use digits and + (e.g., +1 (403) 555-0123)'
        }).warning(),
    }),

    defineField({
      name: 'hours',
      type: 'array',
      title: 'Hours',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'days', type: 'string', title: 'Days (e.g., Sun–Thu)'},
            {name: 'time', type: 'string', title: 'Hours (e.g., 5:00pm–1:00am)'},
          ],
        },
      ],
    }),
    defineField({
      name: 'social',
      type: 'object',
      title: 'Social Links',
      fields: [
        {name: 'facebook', type: 'url'},
        {name: 'instagram', type: 'url'},
        {name: 'tiktok', type: 'url'},
        {name: 'snapchat', type: 'url'},
      ],
    }),
    defineField({name: 'openTableUrl', type: 'url', title: 'OpenTable URL'}),
  ],
})
