import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'x77edsca',
  dataset: process.env.SANITY_DATASET || 'dev',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const TYPES = ['settings', 'menu', 'galleryImage', 'faq', 'event']

async function run() {
  for (const type of TYPES) {
    const docs = await client.fetch<{_id: string}[]>(
      `*[_type == $type && !defined(venueKey)]{_id}`,
      {type},
    )

    if (!docs.length) continue

    console.log(`Backfilling ${docs.length} docs of type ${type}...`)

    let tx = client.transaction()
    for (const d of docs) {
      tx = tx.patch(d._id, {set: {venueKey: 'jungle_bird'}})
    }
    await tx.commit()
  }

  console.log('Done.')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
