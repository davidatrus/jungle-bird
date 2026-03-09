export type VenueKey = 'jungle_bird' | 'prohibition';
export type Post = {
  id: string;
  venueKey: VenueKey;
  title: string;
  excerpt: string;
  image: string;
  href: string;
  slug: string;
  content?: string[];
};

export const posts: Post[] = [
  {
    id: '1',
    title:
      'Why Jungle Bird Is Calgary’s Hottest Date-Night Spot: What to Expect Before You Go',
    venueKey: 'jungle_bird',
    excerpt:
      'Planning a date night in Calgary? Here’s what to expect from Jungle Bird’s ember-lit underground lounge before you go.',
    image: '/images/posts/post-1.png',
    href: '/blog/calgary-date-night-jungle-bird',
    slug: 'calgary-date-night-jungle-bird',
    content: [
      'If you’re planning a date night in Calgary and want something unforgettable—warm, intimate, atmospheric, and a little mysterious—Jungle Bird is the spot locals can’t stop talking about. Tucked beneath 17th Ave SW, this tiki-cave lounge delivers one of Calgary’s most unique date-night experiences. From ember-lit ambiance to expertly crafted cocktails, here’s everything you can expect before you go.',

      'A Hidden, Ember-Lit Escape Under 17th Ave',
      'Part of Jungle Bird’s charm is the moment you step off busy 17th Ave and descend into a glowing, fire-lit hideaway. The space feels like a cinematic escape—basalt textures, bamboo details, warm haze, and sultry lighting set the tone for a slow, intimate evening. Whether it’s a first date, a long-overdue night out, or celebrating something special, this cozy underground lounge instantly pulls you out of Calgary winter and into a tropical retreat.',

      'Cocktails Built for Sharing the Moment',
      'Jungle Bird is known for its classic and remastered tiki cocktails, each built with precision, personality, and a punch of island flavour. Date-night favourites include rum-forward signatures, bright citrus blends, and sharable tiki bowls that make for a playful moment between you and your partner. The bar team brings a modern twist to traditional tiki, ensuring each drink is balanced, bold, and photo-worthy—perfect for couples who appreciate craft cocktails.',

      'A Menu Designed for Snacking and Savoring',
      "Food is just as much a part of the experience as the cocktails. Jungle Bird offers a selection of elevated small plates and tropical-inspired bites that pair perfectly with the drink menu. Think sharable dishes, bold spices, and vibrant flavours that complement the warm cave vibes. Whether you're grazing through the evening or planning a full dinner out on 17th Ave before stopping in, Jungle Bird works seamlessly into any Calgary date-night itinerary.",

      'A Vibe That Makes Conversation Easy',
      'What truly separates Jungle Bird from other Calgary bars and lounges is its atmosphere. The low lighting, warm colours, and rhythmic, jungle-inspired soundtrack create a space where conversation feels natural. It’s lively without being loud and intriguing without being overwhelming. Couples love it because it strikes the sweet spot: energetic enough for fun, intimate enough for connection.',

      'Perfect for Pre-Dinner, Nightcaps, and Everything In Between',
      'Whether you’re starting your night with a cocktail before heading to a nearby restaurant or ending your evening with a late-night drink, Jungle Bird fits effortlessly into a Calgary date-night plan. Its location on 17th Ave SW puts you steps away from some of the city’s best dining and entertainment—and its extended evening hours make it a favourite stop for night owls.',

      'Plan Your Next Date Night at Jungle Bird',
      "If you're searching for Calgary’s best date-night spot, Jungle Bird delivers a one-of-a-kind experience you won’t find anywhere else. Warm, intimate, and full of character, it’s the perfect place to slow down, sip something extraordinary, and enjoy the company of someone special.",
      'Ready to see it for yourself? Book your table now and experience why Jungle Bird is Calgary’s hottest date-night destination.',
    ],
  },

  {
    id: '2',
    title:
      'The Best Tiki Cocktails in Calgary: What to Order at Jungle Bird (and Why)',
    venueKey: 'jungle_bird',
    excerpt:
      'From bold tropical blends to fiery signatures, here are the must-try tiki cocktails at Jungle Bird and why guests love them.',
    image: '/images/posts/post-2.png',
    href: '/blog/best-tiki-cocktails-calgary',
    slug: 'best-tiki-cocktails-calgary',
    content: [
      'If you’re looking for the **best tiki cocktails in Calgary**, Jungle Bird is the place everyone is talking about. This underground tiki-cave lounge on 17th Ave serves some of the most creative, flavour-packed drinks in the city. Whether you love rum cocktails, bold spices, or smooth tropical blends, their menu has something for every taste. If you’re visiting for the first time, here are the must-try cocktails—and exactly why people love them.',

      // 1. Nutty Tourist
      '1. Nutty Tourist',
      '(Signature Cave Cocktails – Page 2)',
      'Nutty Tourist is a strong, spirit-forward drink for people who enjoy deeper flavours. It’s made with double-barrel rye whiskey, brown butter fat wash, roasted macadamia nuts, and black walnut bitters. The flavour is bold, warm, and slightly nutty. If you love cocktails with richness and complexity, this is a must-try.',
      '**Why order it:** It’s unique, smooth, and showcases how Jungle Bird turns classic ingredients into something inventive.',

      // 2. Rumble in the Jungle
      '2. Rumble in the Jungle',
      '(Signature Cave Cocktails – Page 2)',
      'This one is for people who want something fruity, creamy, and tropical. It features Brazilian cachaça, fermented sugarcane, amaro, pineapple, cream, and pure maple syrup. It’s exotic, bright, and slightly sweet with a velvety texture.',
      '**Why order it:** It tastes like a tropical vacation in a glass and is one of the most flavourful tiki drinks in Calgary.',

      // 3. Banana Colada
      '3. Banana Colada',
      '(Signature Cave Cocktails – Page 2)',
      'A playful twist on the classic piña colada, this drink is made with spiced rum, blackstrap rum, banana, nutmeg, coconut, vanilla, lime, and grilled pineapple juice. It’s creamy, smooth, and tropical with a warm banana finish.',
      '**Why order it:** It’s familiar but elevated—perfect for anyone who loves rum cocktails with a fun twist.',

      // 4. Pacific Pearl
      '4. Pacific Pearl',
      '(Signature Cave Cocktails – Page 2)',
      'Pacific Pearl combines smoky mezcal, citrus, tiki bitters, and torched grapefruit. The result is refreshing and earthy with a hint of smoke.',
      '**Why order it:** It’s great for people who prefer a bright, citrusy drink with a bit of depth.',

      // 5. Volcano Kiss
      '5. Volcano Kiss',
      '(Signature Cave Cocktails – Page 2)',
      'Volcano Kiss is fiery, spicy, and full of personality. It mixes tequila, ginger, citrus, habanero, and flame-torched peach. It’s the perfect balance of heat and sweetness.',
      '**Why order it:** If you love spicy cocktails or want something bold, this drink stands out.',

      // 6. Jungle Bird
      '6. Jungle Bird (Classic)',
      '(Tiki Classics – Page 3)',
      'This is the bar’s namesake cocktail and a true tiki classic. It’s made with black rum, bitter Campari, sugarcane, pineapple, and lime. It’s fruity but also bitter and sophisticated.',
      '**Why order it:** It’s one of the most iconic tiki cocktails worldwide—perfect for anyone wanting a true tiki experience.',

      // 7. Mai Thai
      '7. Mai Thai',
      '(Tiki Classics – Page 3)',
      'Jungle Bird’s Mai Thai uses blackstrap rum, triple sec, orgeat, fresh lime, and spiced citrus. It’s nutty, bright, and perfectly balanced.',
      '**Why order it:** It’s a top choice for fans of classic cocktail bars in Calgary who want something both tropical and refined.',

      // Closing section
      'Try Calgary’s Best Tiki Cocktails at Jungle Bird',
      'If you want a true tiki experience with handcrafted drinks and bold flavours, Jungle Bird offers some of the **best cocktails in Calgary**. Whether you like sweet, smoky, spicy, or spirit-forward, there’s a drink on this list you’ll love.',
    ],
  },

  {
    id: '3',
    title:
      'Your Ultimate Guide to Nightlife on 17th Ave: Where to Eat, Drink, and Escape the Cold',
    venueKey: 'jungle_bird',
    excerpt:
      'Looking for winter-friendly nightlife on 17th Ave in Calgary? Here’s how to eat, drink, and stay warm without leaving the strip.',
    image: '/images/posts/post-3.png',
    href: '/blog/17th-ave-nightlife-guide',
    slug: '17th-ave-nightlife-guide',
    content: [
      'If you’re searching for **nightlife on 17th Ave in Calgary**, winter is the best time to explore it. The street is full of energy, bright lights, and warm indoor spots that make cold nights feel easier. Whether you want great cocktails, good food, or a cozy place to relax, 17th Ave has everything you need right in one walkable area.',

      'Why 17th Ave Is Perfect for Calgary Winters',
      'Calgary nights get cold fast, and 17th Ave is one of the best places to stay warm while still enjoying the city. You can move from spot to spot without long walks, and most places offer a comfortable, inviting atmosphere. If you want **things to do in Calgary at night** that don’t involve standing outside, 17th Ave is the place to be.',

      'Warm Up Inside Jungle Bird’s Ember-Lit Lounge',
      'One of the standout spots on 17th Ave is **Jungle Bird**, a tiki-style, ember-lit basement lounge that feels made for winter. As soon as you walk downstairs, the cold disappears. The cozy lighting, tropical design, and warm air instantly make the space feel like a getaway.',
      'Jungle Bird is known for its bold, flavourful tiki cocktails and comfort-focused small plates—perfect for a relaxing night out. If you’re looking for **bars on 17th Ave** that offer something different from the usual Calgary scene, this is the place to start.',

      'What to Eat and Drink on 17th Ave',
      'Jungle Bird’s menu features rum cocktails, citrus flavours, and tropical spices that feel extra refreshing during winter. The food is easy to share and pairs well with their signature drinks, making it a great stop for date night or a casual hangout. It’s one of the top choices for anyone wanting unique cocktails along 17th Ave.',

      'Simple Nighttime Activities Along 17th Ave',
      'Once you’re warmed up, you can enjoy classic indoor-friendly activities like:',
      '• A relaxed walk to take in the street lights.',
      '• A warm dessert or coffee from nearby cafés.',
      '• Browsing local shops that stay open late.',
      '• Watching the nightlife from inside cozy indoor spaces.',
      'Everything is close, easy, and winter-friendly—ideal for enjoying **Calgary nightlife** without freezing.',

      'Plan Your Next Night on 17th Ave',
      'If you want a simple, fun winter night out, 17th Ave offers some of the best indoor options in Calgary. Start or end your night at Jungle Bird to enjoy tropical cocktails, warm lighting, and a comfortable escape from the cold.',
      'It’s the perfect winter spot for eating, drinking, and experiencing the best of **17th Ave Calgary nightlife**.',
    ],
  },
  {
    id: 'p-1',
    venueKey: 'prohibition',
    title: 'The Roaring Twenties: A Decade of Excess and Rebellion',
    excerpt: 'The Roaring Twenties: A Decade of Excess and Rebellion.',
    image: '/images/posts/prohibition-1.webp',
    href: '/prohibition/blog/roaring-twenties-party-era',
    slug: 'roaring-twenties-party-era',
    content: [
      'The 1920s, often called the “Roaring Twenties,” was one of the most unforgettable decades in modern history. It was a time of bold change, social rebellion, economic optimism, and nightlife that felt electric. But what actually made the 1920s such a party era?',

      'The Prohibition Era: A Boozy Beginning',
      'In 1920, the 18th Amendment banned the manufacture, sale, and transportation of alcohol in the United States. Instead of stopping drinking, Prohibition sparked an underground nightlife culture built on secrecy, rebellion, and celebration.',

      'The Speakeasy Revolution',
      'Speakeasies were hidden bars tucked behind unmarked doors, basements, or disguised storefronts. The thrill of the forbidden made them irresistible. Inside, people danced, drank bootleg liquor, and escaped the rules of the day.',

      'Economic Prosperity: Money to Burn',
      'With World War I behind them and industry booming, many people had more disposable income than ever. That prosperity meant more nights out, more entertainment, and more “why not?” energy.',

      'The Birth of Consumer Culture',
      'The 1920s embraced modern life: cars, radios, new fashion, and new social freedom. People wanted more experiences, more excitement, and more style. The mentality was simple: live big.',

      'Social Rebellion: Breaking Free from Tradition',
      'Old rules started to loosen. People experimented with identity, fashion, music, and nightlife. Parties became a symbol of freedom and modernity.',

      'Flappers, Fashion, and Independence',
      'Flappers represented a cultural shift. Shorter skirts, bobbed hair, bold confidence, and a refusal to follow old expectations helped define the carefree mood of the decade.',

      'Jazz and Dance Took Over the Night',
      'Jazz became the soundtrack of the Roaring Twenties. Dance styles like the Charleston and Lindy Hop brought high energy into clubs and dance halls, turning nights out into full-on celebrations.',

      'A Creative Explosion in Art, Design, and Literature',
      'The 1920s also thrived culturally. Art deco influenced everything from architecture to cocktail aesthetics. Writers captured the era’s excess and glamour, and the whole decade felt like a creative spark.',

      'The Roaring Twenties Legacy',
      'The 1920s were a party era shaped by prohibition, prosperity, rebellion, and creativity. It’s a reminder that even in chaotic times, people can still find reasons to celebrate.',
    ],
  },
  {
    id: 'p-2',
    venueKey: 'prohibition',
    title:
      'Step into the Past: Grand Opening of Downtown Calgary’s Most Exclusive Underground Lounge',
    excerpt:
      'Step into the Past: Grand Opening of Downtown Calgary’s Most Exclusive Underground Lounge ',
    image: '/images/posts/prohibition-2.webp',
    href: '/prohibition/blog/step-into-the-past-grand-opening-of-downtown-calgarys-most-exclusive-underground-lounge',
    slug: 'step-into-the-past-grand-opening-of-downtown-calgarys-most-exclusive-underground-lounge',
    content: [
      'Downtown Calgary is about to get a nightlife experience inspired by the Prohibition Era. Prohibition Bar & Lounge invites you to step into a world of hidden glamour, classic cocktails, and the sound of jazz that defined the Roaring Twenties.',

      'Reliving the Roaring Twenties',
      'The 1920s were an era of decadence and rebellion. Speakeasies thrived, cocktails became an art form, and the party never really stopped. Prohibition Bar & Lounge brings that atmosphere back with a vintage-inspired speakeasy vibe designed for modern nights out.',

      'Sounds of the Swing and Jazz Age',
      'The soundtrack matters. The Jazz Age was built on rhythm, movement, and energy, and Prohibition keeps that spirit alive with live music that feels like stepping back in time.',

      'Crafting the Perfect Cocktail',
      'During Prohibition, cocktails evolved into something more than drinks. They became craft, ritual, and identity. Expect classic foundations with modern execution and a focus on quality, balance, and style.',

      'Vintage Décor and Atmosphere',
      'Dim lighting, cozy corners, and vintage details help create the feeling of an underground lounge where the night unfolds slowly and intentionally.',

      'The Grand Opening Experience',
      'If you love speakeasy energy, jazz-era styling, and craft cocktails, the grand opening is your chance to experience the concept from day one.',

      'Reserve Your Table',
      'Secure your spot early and make a night of it. Come with friends, dress the part, and lean into the Roaring Twenties mood.',

      'Actionable Checklist',
      '• Reserve your table for opening night.',
      '• Invite friends and make it a full evening.',
      '• Dress with a touch of vintage style for the full experience.',
    ],
  },
  {
    id: 'p-3',
    venueKey: 'prohibition',
    title: 'Prohibition Era Cocktail: A Vintage Tribute to Summer Refreshment',
    excerpt:
      'Prohibition Era Cocktail: A Vintage Tribute to Summer Refreshment ',
    image: '/images/posts/prohibition-3.jpg',
    href: '/prohibition/blog/prohibition-Era-Cocktail',
    slug: 'prohibition-Era-Cocktail',
    content: [
      'Looking for a refreshing summer cocktail in Calgary’s 17th Ave district? Prohibition Lounge’s Prohibition Era Cocktail is a bright, easy-drinking blend made for patio season.',

      'The Inspiration Behind the Prohibition Era Cocktail',
      'During Prohibition, people got creative. Homemade cocktails and clever combinations became part of the culture. This drink is inspired by that era’s ingenuity and “make it work” energy.',

      'What’s in the Cocktail',
      'The Prohibition Era Cocktail combines gin, fresh lime juice, honey syrup, and soda water. The gin brings subtle botanical character, while lime and soda keep it crisp and refreshing.',

      'The Secret to the Sweetness',
      'Instead of plain sugar, this cocktail uses honey syrup. That adds depth, a smoother sweetness, and a richer finish that pairs well with gin’s herbal notes.',

      'How It Looks (and Why That Matters)',
      'The honey syrup gives the drink a warm golden tint, and the soda adds a light sparkle. It’s one of those cocktails that looks as good as it tastes.',

      'How to Enjoy It',
      'Order it on the patio, sip it slowly, and let it do what summer cocktails should do: cool you down and keep the night going.',

      'Other Prohibition-Inspired Drinks',
      'If you like vintage-style cocktails, you’ll also love classics like Manhattans and Old Fashioneds, plus seasonal spins and modern favourites.',

      'The Atmosphere',
      'Prohibition Lounge is built for intimate nights, date vibes, and relaxed hangs. Dim lighting and vintage décor bring the speakeasy feel without being over-the-top.',

      'FAQs',
      '• Can I make a reservation? Yes, Prohibition Lounge accepts reservations for parties of six or more. Smaller groups are first-come, first-served.',
      '• Does Prohibition Lounge serve food? Yes.',
      '• Is it 18+? Yes, it’s an 18+ venue.',

      'Conclusion',
      'If you want something refreshing, unique, and speakeasy-inspired, the Prohibition Era Cocktail is a must-try.',
    ],
  },
];
