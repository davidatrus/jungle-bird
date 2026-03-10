// studio/deskStructure.ts
import type {StructureResolver} from 'sanity/desk'

const VENUES = [
  {title: 'Jungle Bird', key: 'jungle_bird'},
  {title: 'Prohibition', key: 'prohibition'},
] as const

function templateId(type: string, venueKey: string) {
  return `${type}-${venueKey === 'prohibition' ? 'prohibition' : 'jungle-bird'}`
}

function venueSection(S: Parameters<StructureResolver>[0], venueKey: string, venueTitle: string) {
  const filterByVenue = (type: string) => `_type == "${type}" && venueKey == $venueKey`
  const templateFor = (type: string) =>
    S.initialValueTemplateItem(templateId(type, venueKey), {venueKey})

  return S.listItem()
    .title(venueTitle)
    .child(
      S.list()
        .title(venueTitle)
        .items([
          S.listItem()
            .title('Site Settings')
            .child(
              S.documentList()
                .title('Site Settings')
                .schemaType('settings')
                .filter(filterByVenue('settings'))
                .params({venueKey})
                .initialValueTemplates([templateFor('settings')]),
            ),

          S.divider(),

          S.listItem()
            .title('Menu')
            .child(
              S.documentList()
                .title('Menu')
                .schemaType('menu')
                .filter(filterByVenue('menu'))
                .params({venueKey})
                .initialValueTemplates([templateFor('menu')]),
            ),

          S.listItem()
            .title('Gallery')
            .child(
              S.documentList()
                .title('Gallery')
                .schemaType('galleryImage')
                .filter(filterByVenue('galleryImage'))
                .params({venueKey})
                .initialValueTemplates([templateFor('galleryImage')]),
            ),

          S.listItem()
            .title('FAQ')
            .child(
              S.documentList()
                .title('FAQ')
                .schemaType('faq')
                .filter(filterByVenue('faq'))
                .params({venueKey})
                .initialValueTemplates([templateFor('faq')]),
            ),

          S.listItem()
            .title('Events')
            .child(
              S.documentList()
                .title('Events')
                .schemaType('event')
                .filter(filterByVenue('event'))
                .params({venueKey})
                .initialValueTemplates([templateFor('event')]),
            ),
        ]),
    )
}

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...VENUES.map((v) => venueSection(S, v.key, v.title)),
      S.divider(),
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId?.()
        return !['settings', 'menu', 'galleryImage', 'faq', 'event'].includes(String(id))
      }),
    ])
