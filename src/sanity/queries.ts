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
  hours[]{days, time},
  social{facebook, instagram, tiktok, snapchat},
  openTableUrl
}`;

export const qGallery = `*[_type=="galleryImage"]|order(order asc){
  caption, image
}`;

export const qFaq = `*[_type=="faq"]|order(order asc){
  question, answer
}`;
