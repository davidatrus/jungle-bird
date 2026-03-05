export const qMenu = `*[_type=="menu"][0]{
  version, updated,
  menuPdf{
    alt,
    asset->{url, size, mimeType, originalFilename, extension}
  }
}`;

export const qSettings = `*[_type=="settings"][0]{
  address,
  email,
  phone,
  hours[]{days, time},
  social{facebook, instagram, tiktok, snapchat}
}`;

export const qGallery = `*[_type=="galleryImage"]|order(order asc){
  caption, image
}`;

export const qFaq = `*[_type=="faq"]|order(order asc){
  question, answer
}`;

// =======================
// Events
// =======================
// List page: only show on_sale events publicly
// Events list
export const qEventsList = /* groq */ `
*[_type == "event" && status in ["on_sale","ended"]]
| order(startsAt asc) {
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  venueKey,
  status,
  startsAt,
  endsAt,
  shortDescription,
  isFeatured,
  heroImage,
  ticketTypes[] {
    _key,
    name,
    currency,
    priceCents,
    capacity,
    minPerOrder,
    maxPerOrder,
    ticketsOnSaleAt,
    salesEndAt
  }
}
`;

// Single event by slug
export const qEventBySlug = /* groq */ `
*[_type == "event" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  venueKey,
  status,
  startsAt,
  endsAt,
  shortDescription,
  body,
  heroImage,

  "gallery": gallery[]{
    "image": @,
    "caption": null
  },

  ticketTypes[] {
    _key,
    name,
    currency,
    priceCents,
    capacity,
    minPerOrder,
    maxPerOrder,
    ticketsOnSaleAt,
    salesEndAt
  }
}
`;
