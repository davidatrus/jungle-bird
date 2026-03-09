// src/sanity/queries.ts

export const qMenu = /* groq */ `
*[_type == "menu" && venueKey == $venueKey][0]{
  version, updated,
  venueKey,
  menuPdf{
    alt,
    asset->{url, size, mimeType, originalFilename, extension}
  }
}
`;

export const qSettings = /* groq */ `
*[_type == "settings" && venueKey == $venueKey][0]{
  venueKey,
  address,
  email,
  phone,
  hours[]{days, time},
  social{facebook, instagram, tiktok, snapchat}
}
`;

export const qGallery = /* groq */ `
*[_type == "galleryImage" && venueKey == $venueKey]
| order(order asc){
  venueKey,
  caption,
  image
}
`;

export const qFaq = /* groq */ `
*[_type == "faq" && venueKey == $venueKey]
| order(order asc){
  venueKey,
  question,
  answer
}
`;

// =======================
// Events
// =======================

export const qEventsList = /* groq */ `
*[_type == "event" && venueKey == $venueKey && status in ["on_sale","ended"]]
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

export const qEventBySlug = /* groq */ `
*[_type == "event" && venueKey == $venueKey && slug.current == $slug][0]{
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
