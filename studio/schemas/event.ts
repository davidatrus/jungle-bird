import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'venueKey',
      title: 'Venue',
      type: 'string',
      options: {
        list: [
          {title: 'Jungle Bird', value: 'jungle_bird'},
          {title: 'Prohibition', value: 'prohibition'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'On Sale', value: 'on_sale'},
          {title: 'Ended', value: 'ended'},
          {title: 'Cancelled', value: 'cancelled'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'startsAt',
      title: 'Starts At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'endsAt',
      title: 'Ends At',
      type: 'datetime',
    }),

    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {hotspot: true},
    }),

    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
    }),

    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(240),
    }),

    defineField({
      name: 'body',
      title: 'Details',
      type: 'array',
      of: [{type: 'block'}],
    }),

    defineField({
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'ticketTypes',
      title: 'Ticket Types',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'ticketType',
          title: 'Ticket Type',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              // in sanity schema field for name/title
              validation: (Rule) =>
                Rule.required().custom((value?: string) => {
                  if (!value) return true
                  return value.trim() === value ? true : 'No leading or trailing spaces.'
                }),
            }),
            defineField({
              name: 'priceCents',
              title: 'Price (cents)',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: 'currency',
              title: 'Currency',
              type: 'string',
              initialValue: 'cad',
              options: {
                list: [{title: 'CAD', value: 'cad'}],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'capacity',
              title: 'Capacity',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: 'minPerOrder',
              title: 'Min per order',
              type: 'number',
              initialValue: 2,
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: 'maxPerOrder',
              title: 'Max per order',
              type: 'number',
              validation: (Rule) => Rule.min(1),
            }),
            defineField({
              name: 'ticketsOnSaleAt',
              title: 'Tickets On Sale At',
              type: 'datetime',
              description:
                'Used for the "New" badge. Set to when tickets become available for purchase.',
            }),

            defineField({
              name: 'salesEndAt',
              title: 'Sales End At',
              type: 'datetime',
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'venueKey',
      media: 'heroImage',
    },
  },
})
