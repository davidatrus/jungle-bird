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
export const qEventsList = `
*[_type == "event" && status == "on_sale" && venueKey == "jungle_bird"] | order(startsAt asc) {
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
  heroImage
}
`;

export const qEventBySlug = `
*[_type == "event" && slug.current == $slug && venueKey == "jungle_bird"][0]{
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  venueKey,
  status,
  startsAt,
  endsAt,
  shortDescription,
  body,
  isFeatured,
  heroImage,
  gallery,
  ticketTypes[]{
    name,
    priceCents,
    currency,
    capacity,
    minPerOrder,
    maxPerOrder,
    salesEndAt
  }
}
`;
