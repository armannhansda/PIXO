import { db } from '.';
import {
  users,
  posts,
  categories,
  postsToCategories,
  tags,
  postsToTags,
  likes,
  bookmarks,
  comments,
  followers,
  notifications,
} from './schema';

async function seed() {
  try {
    console.log('🌱 Seeding database...\n');

    const d = db();

    // ── Clear existing data (order matters for FK constraints) ──
    console.log('🗑️  Clearing existing data...');
    await d.delete(notifications);
    await d.delete(followers);
    await d.delete(comments);
    await d.delete(bookmarks);
    await d.delete(likes);
    await d.delete(postsToTags);
    await d.delete(postsToCategories);
    await d.delete(posts);
    await d.delete(tags);
    await d.delete(categories);
    await d.delete(users);
    console.log('✅ Existing data cleared\n');

    // ═══════════════════════════════════════════════════════
    // 1. USERS
    // ═══════════════════════════════════════════════════════
    // Pre-hashed password for all seed users: "Password123"
    const hashedPassword = '$2b$10$vqYw4DybyjQUAmLWPYuen.WEgt8bstgpC712YiLfWkYdaB0w.qY46';

    console.log('👥 Creating users...');
    const insertedUsers = await d
      .insert(users)
      .values([
        {
          name: 'Theodore Reginald',
          username: 'theodore',
          email: 'theodore@example.com',
          password: hashedPassword,
          role: 'admin',
          bio: 'Full-stack developer and open-source enthusiast. Writing about technology, startups, and the future of the web.',
          location: 'San Francisco, CA',
          profileImage: 'https://i.pravatar.cc/300?u=theodore',
        },
        {
          name: 'Elena Martinez',
          username: 'elena',
          email: 'elena@example.com',
          password: hashedPassword,
          bio: 'Food writer and culinary explorer. Passionate about discovering authentic flavors from every corner of the world.',
          location: 'Barcelona, Spain',
          profileImage: 'https://i.pravatar.cc/300?u=elena',
        },
        {
          name: 'James Chen',
          username: 'james',
          email: 'james@example.com',
          password: hashedPassword,
          bio: 'Digital nomad, photographer, and travel storyteller. Currently somewhere in Southeast Asia with a laptop and a camera.',
          location: 'Chiang Mai, Thailand',
          profileImage: 'https://i.pravatar.cc/300?u=james',
        },
        {
          name: 'Sarah Johnson',
          username: 'sarah',
          email: 'sarah@example.com',
          password: hashedPassword,
          bio: 'Budget travel expert and finance blogger. Proving that you don\'t need a fortune to see the world.',
          location: 'Austin, TX',
          profileImage: 'https://i.pravatar.cc/300?u=sarah',
        },
        {
          name: 'Marco Rossi',
          username: 'marco',
          email: 'marco@example.com',
          password: hashedPassword,
          bio: 'Mediterranean lifestyle writer and sailing enthusiast. Covering hidden gems along the European coast.',
          location: 'Naples, Italy',
          profileImage: 'https://i.pravatar.cc/300?u=marco',
        },
        {
          name: 'Priya Sharma',
          username: 'priya',
          email: 'priya@example.com',
          password: hashedPassword,
          bio: 'Wellness coach, yoga instructor, and mindfulness advocate. Helping people find balance in a busy world.',
          location: 'Mumbai, India',
          profileImage: 'https://i.pravatar.cc/300?u=priya',
        },
        {
          name: 'Alex Rivera',
          username: 'alex',
          email: 'alex@example.com',
          password: hashedPassword,
          bio: 'Sports journalist and marathon runner. Covering global athletics and the stories behind the athletes.',
          location: 'Mexico City, Mexico',
          profileImage: 'https://i.pravatar.cc/300?u=alex',
        },
        {
          name: 'Lina Nakamura',
          username: 'lina',
          email: 'lina@example.com',
          password: hashedPassword,
          bio: 'UX designer turned writer. Exploring the intersection of design, technology, and human behavior.',
          location: 'Tokyo, Japan',
          profileImage: 'https://i.pravatar.cc/300?u=lina',
        },
        {
          name: 'David Okafor',
          username: 'david',
          email: 'david@example.com',
          password: hashedPassword,
          bio: 'Environmental scientist and sustainability advocate. Writing about climate action and green innovation.',
          location: 'Lagos, Nigeria',
          profileImage: 'https://i.pravatar.cc/300?u=david',
        },
        {
          name: 'Sophie Laurent',
          username: 'sophie',
          email: 'sophie@example.com',
          password: hashedPassword,
          bio: 'Art critic and gallery curator. Passionate about contemporary art, street art, and emerging creative voices.',
          location: 'Paris, France',
          profileImage: 'https://i.pravatar.cc/300?u=sophie',
        },
      ])
      .returning();

    const [theodore, elena, james, sarah, marco, priya, alex, lina, david, sophie] = insertedUsers;
    console.log(`✅ Created ${insertedUsers.length} users\n`);

    // ═══════════════════════════════════════════════════════
    // 2. CATEGORIES
    // ═══════════════════════════════════════════════════════
    console.log('📂 Creating categories...');
    const insertedCategories = await d
      .insert(categories)
      .values([
        { name: 'Technology', slug: 'technology', description: 'Latest tech news, software development, and digital innovation' },
        { name: 'Travel', slug: 'travel', description: 'Travel guides, destination recommendations, and adventure stories' },
        { name: 'Food & Drink', slug: 'food-drink', description: 'Culinary experiences, recipes, and restaurant reviews' },
        { name: 'Lifestyle', slug: 'lifestyle', description: 'Wellness, productivity, and personal development' },
        { name: 'Business', slug: 'business', description: 'Startups, entrepreneurship, and career insights' },
        { name: 'Science', slug: 'science', description: 'Scientific discoveries, research, and the natural world' },
        { name: 'Design & Art', slug: 'design-art', description: 'Graphic design, fine art, architecture, and creative inspiration' },
        { name: 'Sports & Fitness', slug: 'sports-fitness', description: 'Athletics, workout routines, and sports coverage' },
        { name: 'Finance', slug: 'finance', description: 'Personal finance, investing, and economic trends' },
        { name: 'Entertainment', slug: 'entertainment', description: 'Movies, music, gaming, and pop culture' },
        { name: 'Education', slug: 'education', description: 'Learning resources, tutorials, and academic topics' },
        { name: 'Environment', slug: 'environment', description: 'Sustainability, climate change, and green living' },
        { name: 'Health', slug: 'health', description: 'Physical and mental health, nutrition, and medical breakthroughs' },
        { name: 'Photography', slug: 'photography', description: 'Photography techniques, gear reviews, and visual storytelling' },
        { name: 'Remote Work', slug: 'remote-work', description: 'Working remotely, digital nomad life, and distributed teams' },
      ])
      .returning();

    const [
      catTech, catTravel, catFood, catLifestyle, catBusiness,
      catScience, catDesign, catSports, catFinance, catEntertainment,
      catEducation, catEnvironment, catHealth, catPhotography, catRemoteWork,
    ] = insertedCategories;
    console.log(`✅ Created ${insertedCategories.length} categories\n`);

    // ═══════════════════════════════════════════════════════
    // 3. TAGS
    // ═══════════════════════════════════════════════════════
    console.log('🏷️  Creating tags...');
    const insertedTags = await d
      .insert(tags)
      .values([
        { name: 'JavaScript', slug: 'javascript' },
        { name: 'React', slug: 'react' },
        { name: 'Next.js', slug: 'nextjs' },
        { name: 'TypeScript', slug: 'typescript' },
        { name: 'Python', slug: 'python' },
        { name: 'AI', slug: 'ai' },
        { name: 'Machine Learning', slug: 'machine-learning' },
        { name: 'Web Development', slug: 'web-development' },
        { name: 'CSS', slug: 'css' },
        { name: 'Node.js', slug: 'nodejs' },
        { name: 'Backpacking', slug: 'backpacking' },
        { name: 'Budget Travel', slug: 'budget-travel' },
        { name: 'Solo Travel', slug: 'solo-travel' },
        { name: 'Hiking', slug: 'hiking' },
        { name: 'Beach', slug: 'beach' },
        { name: 'Street Food', slug: 'street-food' },
        { name: 'Recipes', slug: 'recipes' },
        { name: 'Vegan', slug: 'vegan' },
        { name: 'Coffee', slug: 'coffee' },
        { name: 'Wine', slug: 'wine' },
        { name: 'Yoga', slug: 'yoga' },
        { name: 'Meditation', slug: 'meditation' },
        { name: 'Productivity', slug: 'productivity' },
        { name: 'Minimalism', slug: 'minimalism' },
        { name: 'Running', slug: 'running' },
        { name: 'Photography Tips', slug: 'photography-tips' },
        { name: 'Sustainability', slug: 'sustainability' },
        { name: 'Climate Change', slug: 'climate-change' },
        { name: 'Startups', slug: 'startups' },
        { name: 'Investing', slug: 'investing' },
        { name: 'UX Design', slug: 'ux-design' },
        { name: 'Freelancing', slug: 'freelancing' },
        { name: 'Mental Health', slug: 'mental-health' },
        { name: 'Nutrition', slug: 'nutrition' },
        { name: 'Science Fiction', slug: 'science-fiction' },
      ])
      .returning();

    const [
      tagJS, tagReact, tagNext, tagTS, tagPython,
      tagAI, tagML, tagWebDev, tagCSS, tagNode,
      tagBackpacking, tagBudgetTravel, tagSoloTravel, tagHiking, tagBeach,
      tagStreetFood, tagRecipes, tagVegan, tagCoffee, tagWine,
      tagYoga, tagMeditation, tagProductivity, tagMinimalism, tagRunning,
      tagPhotoTips, tagSustainability, tagClimate, tagStartups, tagInvesting,
      tagUX, tagFreelancing, tagMentalHealth, tagNutrition, tagSciFi,
    ] = insertedTags;
    console.log(`✅ Created ${insertedTags.length} tags\n`);

    // ═══════════════════════════════════════════════════════
    // 4. POSTS
    // ═══════════════════════════════════════════════════════
    console.log('📝 Creating posts...');
    const insertedPosts = await d
      .insert(posts)
      .values([
        {
          title: 'The Future of AI: Trends Shaping 2026',
          subtitle: 'From large language models to autonomous agents',
          slug: 'future-of-ai-trends-2026',
          content: `Artificial intelligence has moved far beyond simple chatbots. In 2026, we are witnessing a new wave of AI capabilities that are reshaping entire industries.\n\n## Autonomous Agents\n\nThe biggest shift this year is the rise of autonomous AI agents — systems that can plan, reason, and execute multi-step tasks without constant human oversight. Companies like Anthropic, OpenAI, and Google DeepMind are leading this charge.\n\n## Multimodal Models\n\nModels that seamlessly combine text, image, audio, and video understanding are now mainstream. This has unlocked use cases from automated video editing to real-time translation with cultural context.\n\n## AI in Healthcare\n\nDiagnostic AI is now being used in clinical settings across 40+ countries. Early detection rates for certain cancers have improved by 23% in hospitals using AI-assisted screening.\n\n## What This Means for Developers\n\nIf you're a developer, the key skill is learning how to build applications *with* AI — prompt engineering, RAG architectures, and fine-tuning are becoming as essential as knowing React or SQL.\n\nThe future isn't about AI replacing humans. It's about humans who use AI outperforming those who don't.`,
          excerpt: 'From autonomous agents to multimodal models, explore the AI trends defining 2026 and what they mean for developers.',
          coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
          published: true,
          authorId: theodore.id,
        },
        {
          title: 'Taste of the Alps: A Culinary Journey',
          subtitle: 'Hearty mountain cuisine meets delicate European pastry',
          slug: 'taste-alps-culinary-journey',
          content: `The Alps aren't just about skiing and stunning vistas — they're home to some of Europe's most underrated cuisine.\n\n## Fondue and Raclette\n\nIn the Swiss Alps, fondue is more than a meal — it's a social ritual. The key is using a blend of Gruyère and Vacherin cheeses, with a splash of kirsch and a clove of garlic rubbed inside the caquelon.\n\n## Tyrolean Dumplings\n\nIn Austria's Tyrol region, Knödel (bread dumplings) come in dozens of variations. The speck dumpling, made with cured ham and day-old bread, is comfort food at its finest.\n\n## Alpine Pastries\n\nFrom Sachertorte in Vienna to Engadiner Nusstorte in Switzerland, Alpine pastries are rich, buttery, and perfect with a strong espresso.\n\n## Where to Eat\n\n- **Kronenhütte, Zermatt** — Classic Swiss mountain hut with panoramic Matterhorn views\n- **Gasthaus Stern, Innsbruck** — Family-run Tyrolean restaurant since 1842\n- **Rifugio Lagazuoi, Dolomites** — Italian Alpine cooking at 2,752m elevation\n\nWhether you're fueling up for a hike or winding down after a day on the slopes, Alpine cuisine delivers warmth and flavor in equal measure.`,
          excerpt: 'Discover the flavors and traditions of Alpine cuisine, from hearty mountain dishes to delicate pastries.',
          coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
          published: true,
          authorId: elena.id,
        },
        {
          title: 'Digital Nomad Guide to Southeast Asia',
          subtitle: 'Work remotely from paradise without breaking the bank',
          slug: 'digital-nomad-southeast-asia',
          content: `Southeast Asia remains the top destination for digital nomads in 2026. Here's everything you need to know.\n\n## Best Cities for Remote Work\n\n### Chiang Mai, Thailand\nThe OG nomad hub. Fast wifi, incredible food for $2 a meal, and a massive expat community. Co-working at Punspace or CAMP costs around $100/month.\n\n### Da Nang, Vietnam\nBeachside living with fiber-optic internet. The cost of living is roughly $800-1200/month for a comfortable lifestyle. The tech scene is growing fast.\n\n### Bali, Indonesia\nCanggu and Ubud remain popular. Dojo Bali and Outpost are world-class co-working spaces. Expect to spend $1200-1800/month.\n\n### Kuala Lumpur, Malaysia\nOften overlooked, KL offers excellent infrastructure, fast internet, and a multicultural food scene. The digital nomad visa makes it easy to stay long-term.\n\n## Visa Essentials\n\nThailand's DTV (Digital Nomad Visa) now allows stays of up to 180 days. Indonesia's B211A visa covers 60 days with extensions. Malaysia's DE Rantau pass is valid for 12 months.\n\n## Pro Tips\n\n1. Always have a VPN — some services are geo-restricted\n2. Get a local SIM card on arrival for cheap data\n3. Join nomad communities on Facebook and Discord before you arrive\n4. Budget 10-15% more than you think — visa runs and travel add up`,
          excerpt: 'Everything you need to know about working remotely from Southeast Asia — cities, costs, visas, and pro tips.',
          coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
          published: true,
          authorId: james.id,
        },
        {
          title: 'Budget Travel Hacks That Actually Work',
          subtitle: 'Spend less, travel more — proven strategies from 50+ countries',
          slug: 'budget-travel-hacks-that-work',
          content: `After visiting 52 countries on a modest income, I've learned that smart travel isn't about deprivation — it's about strategy.\n\n## Flights\n\n- **Use Google Flights' Explore feature** to find the cheapest destinations from your city on flexible dates.\n- **Book on Tuesdays** — airlines often release sales early in the week.\n- **Consider positioning flights** — sometimes flying to a nearby cheaper airport and taking a bus saves hundreds.\n- **Error fares are real** — follow accounts like Secret Flying and Jack's Flight Club.\n\n## Accommodation\n\n- **Housesitting** through TrustedHousesitters gives you free accommodation (and a pet to hang out with).\n- **Hostels aren't just for 20-somethings** — many now have private rooms and co-working spaces.\n- **Long-term Airbnb discounts** can be 40-60% cheaper than nightly rates.\n\n## Food\n\n- **Eat where locals eat** — if the menu is only in the local language, you're in the right place.\n- **Markets over restaurants** — fresh produce from local markets is cheap and delicious.\n- **Cook occasionally** — even making breakfast in your hostel saves $5-10/day.\n\n## The Mindset Shift\n\nBudget travel isn't about counting every penny. It's about spending intentionally on what matters to you and cutting ruthlessly on what doesn't. I'd rather eat street food for a week and spend the savings on a once-in-a-lifetime experience.`,
          excerpt: 'Proven strategies from 50+ countries to help you travel the world without draining your savings.',
          coverImage: 'https://images.unsplash.com/photo-1606576142191-3dfe4fd0a1d8?w=800&q=80',
          published: true,
          authorId: sarah.id,
        },
        {
          title: 'Hidden Beaches of the Mediterranean',
          subtitle: 'Escape the crowds at these secret coastal gems',
          slug: 'hidden-beaches-mediterranean',
          content: `Forget Santorini's packed caldera and Barcelona's overflowing Barceloneta. The Mediterranean has thousands of kilometers of coastline, and the best beaches are the ones most tourists never find.\n\n## Cala Macarelleta, Menorca, Spain\n\nA 20-minute hike from the nearest road, this turquoise cove feels like a private lagoon. Arrive early — by noon, the small beach fills up.\n\n## Gjipe Beach, Albania\n\nAlbania's Riviera is Europe's last affordable secret. Gjipe Beach sits at the end of a canyon, accessible only by boat or a steep trail. Crystal-clear water, dramatic cliffs, and almost no tourists.\n\n## Cala Goloritzé, Sardinia, Italy\n\nA UNESCO heritage site accessible only by boat or a 90-minute hike. The natural limestone arch and emerald water make it one of the most photogenic beaches in the entire Mediterranean.\n\n## Kaputaş Beach, Turkey\n\nTucked between two cliffs along the Lycian coast, this narrow beach has striking turquoise water. The 187 steps down are worth every one.\n\n## How to Find Your Own Secret Beach\n\n1. Use Google Earth to scan coastlines for unnamed coves\n2. Ask fishermen — they know every hidden inlet\n3. Visit in shoulder season (May or October)\n4. Be willing to hike or take a boat — the best spots aren't road-accessible`,
          excerpt: 'Discover pristine beaches and hidden coves along the Mediterranean that most tourists never find.',
          coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
          published: true,
          authorId: marco.id,
        },
        {
          title: 'Wellness Retreats: A Guide to Finding Your Zen',
          subtitle: 'The world\'s best retreats for yoga, meditation, and renewal',
          slug: 'wellness-retreats-finding-zen',
          content: `In our hyper-connected world, stepping away to recharge isn't a luxury — it's a necessity. Here are retreats that genuinely transform.\n\n## For Yoga\n\n### Parmarth Niketan, Rishikesh, India\nSitting on the banks of the Ganges, this ashram offers authentic yoga training from 5am to 9pm. The evening Ganga Aarti ceremony is unforgettable. Cost: $15-30/day including meals.\n\n### The Yoga Barn, Ubud, Bali\nA more modern approach with classes ranging from vinyasa to ecstatic dance. Great community vibe and healthy cafés within walking distance.\n\n## For Meditation\n\n### Wat Suan Mokkh, Surat Thani, Thailand\nA 10-day silent meditation retreat in a forest monastery. No phones, no books, no talking. Just you and your mind. Free (donation-based).\n\n### Spirit Rock, California, USA\nInsight meditation retreats led by world-renowned teachers. Programs range from day-long to month-long sits.\n\n## For Digital Detox\n\n### Unplugged, UK\nStay in a beautifully designed off-grid cabin with zero WiFi and no electricity for 3 days. It sounds terrifying. It's actually life-changing.\n\n## Tips for First-Timers\n\n- Start with a short retreat (3-5 days) before committing to longer ones\n- Read reviews from people with similar experience levels\n- Pack layers — meditation halls and yoga shalas can be cold\n- Go with zero expectations — that's the whole point`,
          excerpt: 'A comprehensive guide to the world\'s best wellness retreats for yoga, meditation, and digital detox.',
          coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
          published: true,
          authorId: priya.id,
        },
        {
          title: 'Building a Full-Stack App with Next.js and tRPC',
          subtitle: 'End-to-end type safety from database to UI',
          slug: 'fullstack-nextjs-trpc',
          content: `Type safety across the entire stack used to be a dream. With Next.js, tRPC, and Drizzle ORM, it's now reality.\n\n## The Stack\n\n- **Next.js 15** — App Router with React Server Components\n- **tRPC v11** — Type-safe API layer without REST or GraphQL boilerplate\n- **Drizzle ORM** — SQL-like TypeScript ORM with zero runtime overhead\n- **PostgreSQL** — Rock-solid relational database via Neon serverless\n- **Tailwind CSS v4** — Utility-first styling\n\n## Why tRPC?\n\ntRPC lets you call server functions from the client with full TypeScript inference. Change a field on your server router, and your IDE instantly shows errors in the client. No code generation, no schema files.\n\n\`\`\`typescript\n// server router\nexport const postRouter = router({\n  getById: publicProcedure\n    .input(z.object({ id: z.number() }))\n    .query(({ input }) => {\n      return db.query.posts.findFirst({\n        where: eq(posts.id, input.id),\n        with: { author: true, tags: true },\n      });\n    }),\n});\n\`\`\`\n\n## Project Structure\n\nKeep routers small and focused. One router per domain entity (posts, users, comments) keeps things navigable as the app grows.\n\n## Deployment\n\nDeploy on Vercel with a Neon database. The serverless PostgreSQL connection pooling means you don't need to manage connection limits. Total cost for a hobby project: $0.`,
          excerpt: 'Build a production-ready full-stack app with end-to-end type safety using Next.js, tRPC, and Drizzle ORM.',
          coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
          published: true,
          authorId: theodore.id,
        },
        {
          title: 'Marathon Training for Beginners',
          subtitle: 'From couch to 42.2km — a 20-week plan that works',
          slug: 'marathon-training-beginners',
          content: `Running a marathon is one of the most rewarding physical challenges you can undertake. Here's how to get there safely.\n\n## The 20-Week Plan\n\n### Weeks 1-4: Build the Base\nRun 3 days a week, 20-30 minutes per session. Don't worry about pace — just get comfortable running consistently. Walk breaks are fine.\n\n### Weeks 5-10: Increase Volume\nAdd a fourth running day. Your long run (Saturday or Sunday) gradually increases from 8km to 16km. Easy pace only.\n\n### Weeks 11-16: Peak Training\nLong runs reach 28-32km. Introduce tempo runs on Wednesdays and interval sessions on Tuesdays. This is the hardest phase.\n\n### Weeks 17-20: Taper\nReduce volume by 20-30% per week while maintaining intensity. Your body needs to recover and store energy for race day.\n\n## Nutrition\n\n- **During training**: Increase carb intake on long run days. Aim for 6-8g of carbs per kg of body weight.\n- **Race week**: Carb-load the last 3 days. Avoid new foods.\n- **During the race**: Take a gel or chew every 45 minutes after the first hour.\n\n## Common Mistakes\n\n1. Running too fast on easy days (80% of your runs should be conversational pace)\n2. Skipping rest days\n3. Wearing new shoes on race day\n4. Starting the race too fast — negative splits are the goal\n\nThe marathon doesn't really start until kilometer 30. Everything before that is just the warm-up.`,
          excerpt: 'A realistic 20-week marathon training plan for beginners, covering training phases, nutrition, and race-day strategy.',
          coverImage: 'https://images.unsplash.com/photo-1461896836934-bd45ba3e41f8?w=800&q=80',
          published: true,
          authorId: alex.id,
        },
        {
          title: 'The Psychology of Great UX Design',
          subtitle: 'How cognitive biases shape user experience',
          slug: 'psychology-great-ux-design',
          content: `Great UX isn't about making things pretty — it's about understanding how humans think and designing for their natural behaviors.\n\n## Hick's Law\n\nThe more choices you present, the longer it takes users to decide. This is why the best landing pages have a single clear CTA. Amazon's "Buy Now" button is a masterclass in reducing decision friction.\n\n## The Serial Position Effect\n\nPeople remember the first and last items in a list best. Place your most important navigation items at the beginning and end of your menu. The middle items get forgotten.\n\n## Progressive Disclosure\n\nDon't show everything at once. Reveal complexity as users need it. Gmail does this brilliantly — the compose window starts simple and expands only when you need CC, BCC, or formatting options.\n\n## The Aesthetic-Usability Effect\n\nUsers perceive attractive interfaces as more usable, even when they're not. This doesn't mean prioritize beauty over function — it means invest in both, because polish increases perceived quality.\n\n## Social Proof\n\nRatings, testimonials, and "1,234 people bought this today" messages work because humans are herd animals. We trust the choices of others, especially under uncertainty.\n\n## Practical Takeaways\n\n1. Reduce choices at every decision point\n2. Front-load and end-cap your most important content\n3. Layer complexity — simple first, details on demand\n4. Polish matters — visual quality builds trust\n5. Show that others have made the same choice`,
          excerpt: 'Understanding cognitive biases and psychological principles that make or break user experience design.',
          coverImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80',
          published: true,
          authorId: lina.id,
        },
        {
          title: 'Climate Tech: Innovations That Give Us Hope',
          subtitle: 'The startups and breakthroughs fighting climate change',
          slug: 'climate-tech-innovations-hope',
          content: `While headlines focus on doom, an army of scientists and entrepreneurs are building real solutions to the climate crisis.\n\n## Direct Air Capture\n\nCompanies like Climeworks and Carbon Engineering are pulling CO2 directly from the atmosphere. Climeworks' Orca plant in Iceland captures 4,000 tons of CO2 per year. Their new Mammoth plant scales to 36,000 tons. Costs have dropped from $600/ton to under $300.\n\n## Green Hydrogen\n\nHydrogen produced using renewable energy could decarbonize heavy industry and shipping. The EU's hydrogen strategy targets 10 million tons of domestic production by 2030.\n\n## Solid-State Batteries\n\nToyota and QuantumScape are racing to commercialize solid-state batteries that charge in 10 minutes and last 500,000 miles. This could make EVs cheaper than gas cars by 2028.\n\n## Regenerative Agriculture\n\nFarming practices that restore soil health can sequester massive amounts of carbon. Companies like Indigo Agriculture pay farmers carbon credits for regenerative practices.\n\n## Ocean-Based Solutions\n\nSeaweed farming absorbs CO2 5x faster than land-based forests. Running Tide and Phykos are scaling ocean carbon removal.\n\n## What You Can Do\n\n- Support companies with real climate commitments (not just offsets)\n- Vote for climate-forward policies\n- Reduce consumption — the most sustainable product is one you don't buy\n- Stay informed and push back against doomerism — solutions exist, they just need scale`,
          excerpt: 'From direct air capture to solid-state batteries, the climate tech innovations that are actually making a difference.',
          coverImage: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&q=80',
          published: true,
          authorId: david.id,
        },
        {
          title: 'Street Art Revolution: From Vandalism to Galleries',
          subtitle: 'How graffiti went from criminal offense to cultural force',
          slug: 'street-art-revolution',
          content: `Street art has completed one of the most remarkable cultural transformations of the 21st century.\n\n## The Banksy Effect\n\nWhen Banksy's "Girl with Balloon" self-shredded at Sotheby's in 2018, it wasn't just a stunt — it was a statement about art, value, and institutional power. The shredded piece later sold for $25.4 million.\n\n## Cities as Canvas\n\n### Berlin\nThe East Side Gallery — a 1.3km stretch of the Berlin Wall — is the world's longest open-air gallery. Beyond the wall, neighborhoods like Kreuzberg and Friedrichshain are living canvases.\n\n### Buenos Aires\nArgentina's capital has one of the most vibrant street art scenes globally. Free walking tours take you through Palermo and La Boca, where every wall tells a story.\n\n### Melbourne\nHosier Lane is iconic, but Melbourne's street art extends across entire suburbs. The city actually commissions legal murals to combat unauthorized tagging.\n\n## The Digital Shift\n\nInstagram turned street artists into global celebrities. Artists like JR, Invader, and RETNA have millions of followers and gallery representation — something unthinkable 20 years ago.\n\n## The Tension\n\nIs street art still street art once it's in a gallery? Does institutional acceptance dilute the rebellious spirit? These questions don't have easy answers, but the conversation itself is what makes the movement vital.\n\nOne thing is certain: the streets still speak louder than any gallery wall.`,
          excerpt: 'How graffiti evolved from criminal vandalism to a respected cultural force reshaping the art world.',
          coverImage: 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=800&q=80',
          published: true,
          authorId: sophie.id,
        },
        {
          title: 'Exploring the Wonders of Hiking in Patagonia',
          subtitle: 'Where the Andes meet the end of the world',
          slug: 'hiking-wonders-patagonia',
          content: `Patagonia is a hiker's paradise — raw, wind-battered, and impossibly beautiful.\n\n## The W Trek, Torres del Paine\n\nThe classic 4-5 day trek covers roughly 80km through the park's highlights: the French Valley, Grey Glacier, and the iconic Torres (towers). Book refugios well in advance — they sell out months ahead.\n\n## Mount Fitz Roy, El Chaltén\n\nEl Chaltén is Argentina's trekking capital. The Fitz Roy trail is a challenging day hike (20km round trip) that rewards you with one of the most dramatic mountain views on Earth. Start before dawn to catch sunrise lighting the granite spires.\n\n## The Dientes de Navarino Circuit\n\nFor experienced trekkers, this 5-day circuit on Navarino Island (Chile) is the southernmost trek in the world. No refugios, no markers — just you, the wilderness, and the sub-Antarctic wind.\n\n## Practical Tips\n\n- **Season**: November to March (Southern Hemisphere summer)\n- **Weather**: Bring layers for four seasons in one day. Wind is relentless.\n- **Gear**: Waterproof everything. A 60-80L pack for multi-day treks.\n- **Fitness**: Start training 3+ months before. Hill repeats and loaded pack walks are essential.\n\nPatagonia doesn't care about your Instagram feed. It will test you, humble you, and leave you fundamentally changed.`,
          excerpt: 'A complete guide to Patagonia\'s best treks — from the iconic W Trek to the remote Dientes de Navarino Circuit.',
          coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
          published: true,
          authorId: james.id,
        },
        {
          title: 'Investing for Millennials: Building Wealth in Your 30s',
          subtitle: 'It\'s not too late to start — here\'s your action plan',
          slug: 'investing-millennials-wealth-30s',
          content: `If you're in your 30s and haven't started investing, don't panic. Time is still on your side — but you need to start now.\n\n## The Power of Compound Interest\n\nInvesting $500/month starting at 30, with an average 8% annual return, gives you roughly $1 million by age 60. Starting at 40 with the same amount? Only about $450,000. The math is unforgiving but motivating.\n\n## Where to Start\n\n### 1. Emergency Fund First\nBefore investing, have 3-6 months of expenses in a high-yield savings account. This prevents you from selling investments at the worst time.\n\n### 2. Maximize Tax-Advantaged Accounts\n- **401(k)**: At minimum, contribute enough to get your employer match — that's free money.\n- **Roth IRA**: Post-tax contributions, tax-free growth. Ideal for people who expect higher income later.\n\n### 3. Low-Cost Index Funds\nForget stock picking. A simple three-fund portfolio (US stocks, international stocks, bonds) through Vanguard or Fidelity beats most active managers over time.\n\n## What to Avoid\n\n- Crypto as your primary investment (high risk, keep it under 5%)\n- Individual stock concentration — diversification is your friend\n- Timing the market — time IN the market beats timing the market\n- High-fee financial advisors (look for fee-only fiduciaries)\n\n## The Psychological Game\n\nThe hardest part isn't picking investments — it's not panic-selling during downturns. Every market crash in history has been followed by a recovery. Stay the course.`,
          excerpt: 'A practical investing guide for millennials — build real wealth in your 30s with proven strategies.',
          coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
          published: true,
          authorId: sarah.id,
        },
        {
          title: 'Mastering Street Food Photography',
          subtitle: 'Capture the sizzle, steam, and soul of street vendors worldwide',
          slug: 'mastering-street-food-photography',
          content: `Street food photography sits at the intersection of two of my favorite things — food and travel. Here's how to capture it authentically.\n\n## Gear\n\nYou don't need a full camera setup. A modern smartphone with a good camera handles 90% of street food photography. If you do bring a camera, a 35mm or 50mm prime lens is ideal for tight market stalls.\n\n## Lighting\n\nNatural light is your best friend. Position yourself so the food is between you and the light source (backlight) for that dreamy steam/smoke effect. Avoid flash — it kills the atmosphere and annoys vendors.\n\n## Composition\n\n- **Include the hands**: Hands preparing food tell a story. A bowl of ramen is nice; the chef ladling broth into it is compelling.\n- **Go wide occasionally**: Show the context — the stall, the queue, the neighborhood. Not every food photo needs to be a close-up.\n- **Shoot the sizzle**: Capture the exact moment food hits the wok or grill. Anticipate the action.\n\n## The Human Element\n\nAlways ask permission before photographing vendors. A smile and pointing at your camera is universal. Buy something first — you're documenting their livelihood, not exploiting it.\n\n## Editing\n\nKeep it natural. Boost warmth slightly, add a touch of contrast, and sharpen selectively. Street food should look real and appetizing, not over-processed.\n\n## Best Cities for Street Food Photography\n\n1. Bangkok, Thailand — Chinatown at night is unreal\n2. Mexico City — Taco stands lit by bare bulbs\n3. Marrakech, Morocco — Jemaa el-Fnaa at dusk\n4. Penang, Malaysia — Hawker centers with character\n5. Istanbul, Turkey — Balık ekmek boats on the Bosphorus`,
          excerpt: 'Practical tips for capturing stunning street food photos that tell the story of the vendor and the culture.',
          coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
          published: true,
          authorId: james.id,
        },
        {
          title: 'The Art of Sourdough: A Complete Guide',
          subtitle: 'From starter to perfect loaf in 30 days',
          slug: 'art-of-sourdough-guide',
          content: `Making sourdough bread is part science, part art, and entirely addictive.\n\n## Creating Your Starter\n\n### Day 1\nMix 50g whole wheat flour with 50g water (room temp) in a clean jar. Cover loosely. Wait 24 hours.\n\n### Days 2-7\nDiscard half the starter each day. Feed with 50g flour + 50g water. By day 5-7, you should see consistent bubbling and a pleasant sour smell.\n\n### Maintaining\nOnce active, feed daily if kept at room temp, or weekly if refrigerated.\n\n## The Basic Loaf\n\n**Ingredients:**\n- 100g active starter\n- 375g water\n- 500g bread flour\n- 10g salt\n\n**Method:**\n1. Mix starter, water, and flour. Rest 30 minutes (autolyse).\n2. Add salt. Perform 4 sets of stretch-and-folds over 2 hours.\n3. Bulk ferment 4-6 hours until doubled.\n4. Shape and place in a banneton. Cold-retard in fridge 12-18 hours.\n5. Bake in a Dutch oven at 250°C: 20 min lid on, 20 min lid off.\n\n## Troubleshooting\n\n| Problem | Cause | Fix |\n|---------|-------|-----|\n| Dense crumb | Under-fermented | Longer bulk ferment |\n| Too sour | Over-fermented | Shorter cold retard |\n| No ear | Weak shaping | Practice pre-shaping |\n| Flat loaf | Weak gluten | More stretch-and-folds |\n\nSourdough teaches patience. Your first loaf will be imperfect. Your twentieth will be incredible. Enjoy the journey.`,
          excerpt: 'Everything you need to create a sourdough starter from scratch and bake your first perfect loaf.',
          coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
          published: true,
          authorId: elena.id,
        },
        {
          title: 'Remote Work Burnout: Signs and Solutions',
          subtitle: 'Why working from anywhere can burn you out everywhere',
          slug: 'remote-work-burnout-solutions',
          content: `Remote work was supposed to be freedom. For many, it became a trap of always-on availability and eroding boundaries.\n\n## The Warning Signs\n\n1. **Sunday dread has become daily dread** — you feel exhausted before the workday even starts.\n2. **Your living room feels like an office** — you can't relax in spaces where you work.\n3. **Video call fatigue** — the thought of another Zoom meeting fills you with anxiety.\n4. **Productivity guilt** — you feel like you should always be working because your "office" is always there.\n5. **Social withdrawal** — you decline invitations because you're too drained.\n\n## Why Remote Burnout Hits Different\n\nIn an office, you have natural transitions: commute, lunch break, walking between meetings. Remote work compresses everything into a single screen in a single room. The lack of physical boundaries makes it hard for your brain to switch modes.\n\n## Evidence-Based Solutions\n\n### Create Artificial Commutes\nTake a 15-minute walk before and after work. This signals to your brain that the workday has started and ended.\n\n### The 2-Room Rule\nNever work in the room where you sleep. If you only have one room, create a visual barrier — even a curtain dividing the space helps.\n\n### Async-First Communication\nPush for async tools (Loom, Notion, written updates) over meetings. Most "quick syncs" should be a message.\n\n### Schedule Emptiness\nBlock 2 hours per week with no meetings, no tasks, no agenda. Protect this time ruthlessly.\n\n### Touch Grass (Literally)\n20 minutes of outdoor time per day reduces cortisol by 20%. It's not woo — it's neuroscience.\n\nRemote work is a privilege worth protecting. But it requires intentional boundaries that offices used to provide for free.`,
          excerpt: 'Recognize the signs of remote work burnout and implement practical solutions backed by research.',
          coverImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
          published: true,
          authorId: lina.id,
        },
        {
          title: 'Vegan Comfort Food: 10 Recipes That Convert Skeptics',
          subtitle: 'No one will miss the meat — we promise',
          slug: 'vegan-comfort-food-recipes',
          content: `Vegan food doesn't have to be salads and smoothie bowls. These recipes deliver the rich, satisfying comfort that makes people forget they're eating plants.\n\n## 1. Mushroom Bourguignon\nChunky portobello and cremini mushrooms braised in red wine with pearl onions, carrots, and thyme. Serve over creamy mashed potatoes. The umami depth rivals any beef version.\n\n## 2. Cauliflower Mac and Cheese\nA cashew-and-nutritional-yeast sauce that's creamy, tangy, and gratifying. Bake with panko breadcrumbs for a crispy top.\n\n## 3. Jackfruit Pulled "Pork" Tacos\nYoung jackfruit shredded and slow-cooked in BBQ sauce is eerily similar to pulled pork. Top with coleslaw and pickled onions.\n\n## 4. Lentil Bolognese\nFinely diced vegetables and brown lentils simmered in tomato sauce for 2 hours. The key is patience — low and slow develops the depth.\n\n## 5. Coconut Curry Ramen\nRich coconut broth with lemongrass, chili, and lime. Loaded with tofu, bok choy, mushrooms, and fresh herbs.\n\n## 6. Black Bean Burgers\nNot the mushy kind. These use roasted black beans, smoked paprika, and are pan-seared for a proper crust.\n\n## 7. Chickpea Tikka Masala\nRoasted chickpeas in a creamy tomato-spice sauce. Serve over basmati rice with warm naan.\n\n## 8. Sweet Potato and Black Bean Chili\nSmoky, hearty, and perfect for cold days. Top with avocado, cilantro, and a squeeze of lime.\n\n## 9. Eggplant Parmesan\nThick slices of eggplant, breaded and baked, layered with marinara and vegan mozzarella.\n\n## 10. Chocolate Avocado Mousse\nBlend ripe avocados with cocoa powder, maple syrup, and a pinch of salt. Silky, decadent, and shockingly healthy.\n\nThe secret to great vegan cooking isn't substitution — it's embracing what plants do best.`,
          excerpt: 'Ten hearty vegan comfort food recipes that prove plant-based eating can be rich, satisfying, and crowd-pleasing.',
          coverImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
          published: true,
          authorId: elena.id,
        },
        {
          title: 'The Science of Sleep: Why You Need More of It',
          subtitle: 'What happens in your brain when you finally rest',
          slug: 'science-of-sleep',
          content: `Sleep isn't wasted time — it's when your brain does its most critical maintenance.\n\n## What Happens During Sleep\n\n### Stage 1-2: Light Sleep\nYour brain begins consolidating short-term memories. Heart rate and body temperature drop. Lasts about 20 minutes per cycle.\n\n### Stage 3: Deep Sleep (Slow-Wave)\nGrowth hormone is released, repairing muscles and tissues. Your immune system strengthens. The glymphatic system flushes toxins (including beta-amyloid, linked to Alzheimer's) from the brain.\n\n### REM Sleep\nDreaming occurs here. The brain processes emotions, consolidates complex learning, and practices problem-solving. Getting too little REM sleep is linked to anxiety and depression.\n\n## The Cost of Sleep Deprivation\n\n- **After 17 hours awake**: Cognitive impairment equivalent to a blood alcohol level of 0.05%\n- **Chronic sleep debt**: Increases risk of heart disease by 48%, type 2 diabetes by 40%, and obesity by 55%\n- **One week of 6-hour nights**: 711 genes change expression — many related to immune response and stress\n\n## Evidence-Based Tips for Better Sleep\n\n1. **Consistent schedule** — same wake time every day, even weekends\n2. **Cool room** — 18-19°C (65-67°F) is optimal\n3. **No screens 1 hour before bed** — or use night mode + blue-light glasses\n4. **Morning sunlight** — 10 minutes of outdoor light anchors your circadian rhythm\n5. **No caffeine after 2pm** — caffeine's half-life is 5-6 hours\n6. **Alcohol is not a sleep aid** — it fragments sleep architecture even if it makes you drowsy\n\nSleep is the single most effective thing you can do for your brain and body. Treat it like the non-negotiable it is.`,
          excerpt: 'Understanding sleep stages, the cost of deprivation, and evidence-based tips for better rest.',
          coverImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80',
          published: true,
          authorId: priya.id,
        },
        {
          title: 'CSS in 2026: What Changed and What Matters',
          subtitle: 'Container queries, cascade layers, and the death of CSS hacks',
          slug: 'css-2026-whats-new',
          content: `CSS has undergone a quiet revolution. Features we've wanted for decades are now shipping in every major browser.\n\n## Container Queries\n\nThe most requested CSS feature ever is now production-ready. Instead of basing layouts on viewport width, components can respond to their container's size.\n\n\`\`\`css\n.card-container {\n  container-type: inline-size;\n}\n\n@container (min-width: 400px) {\n  .card { display: grid; grid-template-columns: 1fr 2fr; }\n}\n\`\`\`\n\nThis fundamentally changes component design — cards, sidebars, and widgets can be truly responsive regardless of where they're placed.\n\n## Cascade Layers\n\n\`@layer\` gives you explicit control over specificity ordering. No more fighting framework styles with \`!important\`.\n\n\`\`\`css\n@layer base, components, utilities;\n\n@layer base { h1 { font-size: 2rem; } }\n@layer utilities { .text-lg { font-size: 1.5rem; } }\n\`\`\`\n\n## :has() — The Parent Selector\n\nFinally. Select elements based on what they contain.\n\n\`\`\`css\n/* Style a card differently if it contains an image */\n.card:has(img) { grid-template-rows: 200px 1fr; }\n\n/* Highlight a form group if its input is invalid */\n.form-group:has(input:invalid) { border-color: red; }\n\`\`\`\n\n## View Transitions API\n\nSmooth page transitions that used to require JavaScript frameworks are now a CSS one-liner:\n\n\`\`\`css\n@view-transition { navigation: auto; }\n\`\`\`\n\n## What This Means\n\nWe're entering an era where CSS alone can handle layouts, transitions, and responsive logic that previously required JavaScript. Write less JS, embrace the platform.`,
          excerpt: 'Container queries, cascade layers, :has(), and view transitions — CSS in 2026 is more powerful than ever.',
          coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80',
          published: true,
          authorId: theodore.id,
        },
        {
          title: 'Zero-Waste Living: A Practical Starter Guide',
          subtitle: 'Small changes that add up to a massive difference',
          slug: 'zero-waste-living-starter-guide',
          content: `You don't need to fit a year's trash in a mason jar to make an impact. Here's how to meaningfully reduce waste without turning your life upside down.\n\n## The Big Wins\n\nThese five changes eliminate roughly 60% of household waste:\n\n1. **Reusable water bottle and coffee cup** — prevents 300+ single-use containers per year\n2. **Cloth shopping bags** — keep them in your car or by the door so you never forget\n3. **Meal planning** — food waste is the #1 contributor to landfill by weight\n4. **Refuse junk mail** — register with opt-out services and go paperless on bills\n5. **Buy in bulk** — bring your own containers to bulk stores for grains, nuts, and cleaning supplies\n\n## The Kitchen\n\n- Compost food scraps (even apartment-dwellers can use bokashi bins)\n- Replace cling wrap with beeswax wraps or silicone lids\n- Use bar soap and solid dish soap to eliminate plastic bottles\n- Store produce properly — lettuce in damp towels, herbs in water like flowers\n\n## The Bathroom\n\n- Switch to a safety razor (one metal razor vs. 12+ plastic cartridges/year)\n- Shampoo and conditioner bars last 2-3x longer than bottles\n- Bamboo toothbrush and toothpaste tablets\n- Menstrual cups or period underwear\n\n## The Mindset\n\nZero-waste isn't about perfection — it's about intention. Every piece of plastic you don't buy is one that won't end up in a landfill or ocean. Progress over perfection.\n\nStart with one swap this week. Next week, add another. In a year, you'll barely recognize your old habits.`,
          excerpt: 'A practical guide to reducing household waste with simple swaps that make a real environmental difference.',
          coverImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80',
          published: true,
          authorId: david.id,
        },
      ])
      .returning();

    const [
      postAI, postAlps, postNomad, postBudget, postBeach,
      postWellness, postNextjs, postMarathon, postUX, postClimate,
      postStreetArt, postPatagonia, postInvesting, postFoodPhoto, postSourdough,
      postBurnout, postVegan, postSleep, postCSS, postZeroWaste,
    ] = insertedPosts;
    console.log(`✅ Created ${insertedPosts.length} posts\n`);

    // ═══════════════════════════════════════════════════════
    // 5. POST → CATEGORY RELATIONSHIPS
    // ═══════════════════════════════════════════════════════
    console.log('🔗 Linking posts to categories...');
    await d.insert(postsToCategories).values([
      { postId: postAI.id, categoryId: catTech.id },
      { postId: postAlps.id, categoryId: catFood.id },
      { postId: postAlps.id, categoryId: catTravel.id },
      { postId: postNomad.id, categoryId: catTravel.id },
      { postId: postNomad.id, categoryId: catRemoteWork.id },
      { postId: postBudget.id, categoryId: catTravel.id },
      { postId: postBudget.id, categoryId: catFinance.id },
      { postId: postBeach.id, categoryId: catTravel.id },
      { postId: postWellness.id, categoryId: catLifestyle.id },
      { postId: postWellness.id, categoryId: catHealth.id },
      { postId: postNextjs.id, categoryId: catTech.id },
      { postId: postNextjs.id, categoryId: catEducation.id },
      { postId: postMarathon.id, categoryId: catSports.id },
      { postId: postMarathon.id, categoryId: catHealth.id },
      { postId: postUX.id, categoryId: catDesign.id },
      { postId: postUX.id, categoryId: catTech.id },
      { postId: postClimate.id, categoryId: catScience.id },
      { postId: postClimate.id, categoryId: catEnvironment.id },
      { postId: postStreetArt.id, categoryId: catDesign.id },
      { postId: postStreetArt.id, categoryId: catEntertainment.id },
      { postId: postPatagonia.id, categoryId: catTravel.id },
      { postId: postInvesting.id, categoryId: catFinance.id },
      { postId: postInvesting.id, categoryId: catBusiness.id },
      { postId: postFoodPhoto.id, categoryId: catPhotography.id },
      { postId: postFoodPhoto.id, categoryId: catFood.id },
      { postId: postSourdough.id, categoryId: catFood.id },
      { postId: postBurnout.id, categoryId: catRemoteWork.id },
      { postId: postBurnout.id, categoryId: catHealth.id },
      { postId: postVegan.id, categoryId: catFood.id },
      { postId: postVegan.id, categoryId: catLifestyle.id },
      { postId: postSleep.id, categoryId: catHealth.id },
      { postId: postSleep.id, categoryId: catScience.id },
      { postId: postCSS.id, categoryId: catTech.id },
      { postId: postCSS.id, categoryId: catEducation.id },
      { postId: postZeroWaste.id, categoryId: catEnvironment.id },
      { postId: postZeroWaste.id, categoryId: catLifestyle.id },
    ]);
    console.log('✅ Post-category links created\n');

    // ═══════════════════════════════════════════════════════
    // 6. POST → TAG RELATIONSHIPS
    // ═══════════════════════════════════════════════════════
    console.log('🏷️  Linking posts to tags...');
    await d.insert(postsToTags).values([
      { postId: postAI.id, tagId: tagAI.id },
      { postId: postAI.id, tagId: tagML.id },
      { postId: postAI.id, tagId: tagPython.id },
      { postId: postAlps.id, tagId: tagRecipes.id },
      { postId: postAlps.id, tagId: tagCoffee.id },
      { postId: postNomad.id, tagId: tagBackpacking.id },
      { postId: postNomad.id, tagId: tagBudgetTravel.id },
      { postId: postNomad.id, tagId: tagSoloTravel.id },
      { postId: postBudget.id, tagId: tagBudgetTravel.id },
      { postId: postBudget.id, tagId: tagBackpacking.id },
      { postId: postBeach.id, tagId: tagBeach.id },
      { postId: postBeach.id, tagId: tagSoloTravel.id },
      { postId: postWellness.id, tagId: tagYoga.id },
      { postId: postWellness.id, tagId: tagMeditation.id },
      { postId: postWellness.id, tagId: tagMentalHealth.id },
      { postId: postNextjs.id, tagId: tagJS.id },
      { postId: postNextjs.id, tagId: tagReact.id },
      { postId: postNextjs.id, tagId: tagNext.id },
      { postId: postNextjs.id, tagId: tagTS.id },
      { postId: postNextjs.id, tagId: tagWebDev.id },
      { postId: postMarathon.id, tagId: tagRunning.id },
      { postId: postMarathon.id, tagId: tagNutrition.id },
      { postId: postUX.id, tagId: tagUX.id },
      { postId: postUX.id, tagId: tagProductivity.id },
      { postId: postClimate.id, tagId: tagClimate.id },
      { postId: postClimate.id, tagId: tagSustainability.id },
      { postId: postStreetArt.id, tagId: tagPhotoTips.id },
      { postId: postPatagonia.id, tagId: tagHiking.id },
      { postId: postPatagonia.id, tagId: tagBackpacking.id },
      { postId: postInvesting.id, tagId: tagInvesting.id },
      { postId: postInvesting.id, tagId: tagStartups.id },
      { postId: postFoodPhoto.id, tagId: tagPhotoTips.id },
      { postId: postFoodPhoto.id, tagId: tagStreetFood.id },
      { postId: postSourdough.id, tagId: tagRecipes.id },
      { postId: postBurnout.id, tagId: tagFreelancing.id },
      { postId: postBurnout.id, tagId: tagMentalHealth.id },
      { postId: postBurnout.id, tagId: tagProductivity.id },
      { postId: postVegan.id, tagId: tagVegan.id },
      { postId: postVegan.id, tagId: tagRecipes.id },
      { postId: postVegan.id, tagId: tagNutrition.id },
      { postId: postSleep.id, tagId: tagMentalHealth.id },
      { postId: postSleep.id, tagId: tagNutrition.id },
      { postId: postCSS.id, tagId: tagCSS.id },
      { postId: postCSS.id, tagId: tagWebDev.id },
      { postId: postCSS.id, tagId: tagJS.id },
      { postId: postZeroWaste.id, tagId: tagSustainability.id },
      { postId: postZeroWaste.id, tagId: tagMinimalism.id },
    ]);
    console.log('✅ Post-tag links created\n');

    // ═══════════════════════════════════════════════════════
    // 7. LIKES
    // ═══════════════════════════════════════════════════════
    console.log('❤️  Creating likes...');
    await d.insert(likes).values([
      // postAI gets lots of love
      { userId: elena.id, postId: postAI.id },
      { userId: james.id, postId: postAI.id },
      { userId: sarah.id, postId: postAI.id },
      { userId: lina.id, postId: postAI.id },
      { userId: david.id, postId: postAI.id },
      { userId: sophie.id, postId: postAI.id },
      // postAlps
      { userId: theodore.id, postId: postAlps.id },
      { userId: marco.id, postId: postAlps.id },
      { userId: priya.id, postId: postAlps.id },
      { userId: sophie.id, postId: postAlps.id },
      // postNomad
      { userId: theodore.id, postId: postNomad.id },
      { userId: elena.id, postId: postNomad.id },
      { userId: sarah.id, postId: postNomad.id },
      { userId: alex.id, postId: postNomad.id },
      { userId: lina.id, postId: postNomad.id },
      // postBudget
      { userId: james.id, postId: postBudget.id },
      { userId: marco.id, postId: postBudget.id },
      { userId: priya.id, postId: postBudget.id },
      // postBeach
      { userId: elena.id, postId: postBeach.id },
      { userId: james.id, postId: postBeach.id },
      { userId: sarah.id, postId: postBeach.id },
      { userId: priya.id, postId: postBeach.id },
      { userId: alex.id, postId: postBeach.id },
      { userId: sophie.id, postId: postBeach.id },
      // postWellness
      { userId: elena.id, postId: postWellness.id },
      { userId: lina.id, postId: postWellness.id },
      { userId: david.id, postId: postWellness.id },
      // postNextjs
      { userId: james.id, postId: postNextjs.id },
      { userId: lina.id, postId: postNextjs.id },
      { userId: david.id, postId: postNextjs.id },
      { userId: alex.id, postId: postNextjs.id },
      // postMarathon
      { userId: theodore.id, postId: postMarathon.id },
      { userId: sarah.id, postId: postMarathon.id },
      { userId: priya.id, postId: postMarathon.id },
      { userId: david.id, postId: postMarathon.id },
      // postUX
      { userId: theodore.id, postId: postUX.id },
      { userId: elena.id, postId: postUX.id },
      { userId: james.id, postId: postUX.id },
      { userId: alex.id, postId: postUX.id },
      { userId: sophie.id, postId: postUX.id },
      // postClimate
      { userId: theodore.id, postId: postClimate.id },
      { userId: elena.id, postId: postClimate.id },
      { userId: priya.id, postId: postClimate.id },
      { userId: lina.id, postId: postClimate.id },
      { userId: sophie.id, postId: postClimate.id },
      // postStreetArt
      { userId: marco.id, postId: postStreetArt.id },
      { userId: lina.id, postId: postStreetArt.id },
      { userId: david.id, postId: postStreetArt.id },
      // postPatagonia
      { userId: marco.id, postId: postPatagonia.id },
      { userId: alex.id, postId: postPatagonia.id },
      { userId: sarah.id, postId: postPatagonia.id },
      { userId: sophie.id, postId: postPatagonia.id },
      // postInvesting
      { userId: theodore.id, postId: postInvesting.id },
      { userId: marco.id, postId: postInvesting.id },
      { userId: james.id, postId: postInvesting.id },
      // postSourdough
      { userId: marco.id, postId: postSourdough.id },
      { userId: priya.id, postId: postSourdough.id },
      { userId: lina.id, postId: postSourdough.id },
      { userId: sophie.id, postId: postSourdough.id },
      { userId: david.id, postId: postSourdough.id },
      // postBurnout
      { userId: theodore.id, postId: postBurnout.id },
      { userId: james.id, postId: postBurnout.id },
      { userId: alex.id, postId: postBurnout.id },
      { userId: david.id, postId: postBurnout.id },
      // postVegan
      { userId: priya.id, postId: postVegan.id },
      { userId: david.id, postId: postVegan.id },
      { userId: sophie.id, postId: postVegan.id },
      // postSleep
      { userId: theodore.id, postId: postSleep.id },
      { userId: elena.id, postId: postSleep.id },
      { userId: alex.id, postId: postSleep.id },
      { userId: lina.id, postId: postSleep.id },
      // postCSS
      { userId: james.id, postId: postCSS.id },
      { userId: lina.id, postId: postCSS.id },
      { userId: david.id, postId: postCSS.id },
      // postZeroWaste
      { userId: elena.id, postId: postZeroWaste.id },
      { userId: priya.id, postId: postZeroWaste.id },
      { userId: sophie.id, postId: postZeroWaste.id },
      { userId: alex.id, postId: postZeroWaste.id },
      { userId: lina.id, postId: postZeroWaste.id },
    ]);
    console.log('✅ Likes created\n');

    // ═══════════════════════════════════════════════════════
    // 8. BOOKMARKS
    // ═══════════════════════════════════════════════════════
    console.log('🔖 Creating bookmarks...');
    await d.insert(bookmarks).values([
      { userId: theodore.id, postId: postClimate.id },
      { userId: theodore.id, postId: postUX.id },
      { userId: elena.id, postId: postSourdough.id },
      { userId: elena.id, postId: postVegan.id },
      { userId: elena.id, postId: postNomad.id },
      { userId: james.id, postId: postAI.id },
      { userId: james.id, postId: postNextjs.id },
      { userId: james.id, postId: postBeach.id },
      { userId: sarah.id, postId: postInvesting.id },
      { userId: sarah.id, postId: postBurnout.id },
      { userId: sarah.id, postId: postMarathon.id },
      { userId: marco.id, postId: postAlps.id },
      { userId: marco.id, postId: postPatagonia.id },
      { userId: priya.id, postId: postSleep.id },
      { userId: priya.id, postId: postWellness.id },
      { userId: priya.id, postId: postZeroWaste.id },
      { userId: alex.id, postId: postMarathon.id },
      { userId: alex.id, postId: postPatagonia.id },
      { userId: lina.id, postId: postCSS.id },
      { userId: lina.id, postId: postUX.id },
      { userId: lina.id, postId: postStreetArt.id },
      { userId: david.id, postId: postClimate.id },
      { userId: david.id, postId: postZeroWaste.id },
      { userId: sophie.id, postId: postStreetArt.id },
      { userId: sophie.id, postId: postFoodPhoto.id },
    ]);
    console.log('✅ Bookmarks created\n');

    // ═══════════════════════════════════════════════════════
    // 9. COMMENTS (with nested replies)
    // ═══════════════════════════════════════════════════════
    console.log('💬 Creating comments...');
    const insertedComments = await d
      .insert(comments)
      .values([
        // postAI comments
        {
          content: 'This is a fantastic overview. The section on autonomous agents is spot on — I\'ve been experimenting with agent frameworks and the capabilities are growing fast.',
          postId: postAI.id,
          authorId: lina.id,
        },
        {
          content: 'Great article! Do you think autonomous agents will replace traditional SaaS tools, or will they augment them?',
          postId: postAI.id,
          authorId: james.id,
        },
        {
          content: 'The healthcare stats are impressive. My cousin is a radiologist and confirms AI-assisted screening has been a game changer in their hospital.',
          postId: postAI.id,
          authorId: sarah.id,
        },

        // postAlps comments
        {
          content: 'I visited Kronenhütte last winter and it was incredible! The fondue with that Matterhorn view is unforgettable.',
          postId: postAlps.id,
          authorId: marco.id,
        },
        {
          content: 'You forgot to mention Kaiserschmarrn! It\'s the best Austrian dessert and perfect after a day of skiing 😄',
          postId: postAlps.id,
          authorId: sophie.id,
        },

        // postNomad comments
        {
          content: 'I\'ve been in Chiang Mai for 3 months now and can confirm — Punspace is great but also check out Yellow co-working. Slightly more expensive but the community events are worth it.',
          postId: postNomad.id,
          authorId: alex.id,
        },
        {
          content: 'How\'s the internet situation in Da Nang these days? I had connectivity issues there in 2024.',
          postId: postNomad.id,
          authorId: lina.id,
        },

        // postNextjs comments
        {
          content: 'tRPC changed how I think about APIs. The TypeScript inference is magical — no more API contract mismatches between frontend and backend.',
          postId: postNextjs.id,
          authorId: david.id,
        },
        {
          content: 'Would you recommend Drizzle ORM over Prisma? I\'ve been using Prisma but Drizzle\'s SQL-like syntax is tempting.',
          postId: postNextjs.id,
          authorId: lina.id,
        },

        // postMarathon comments
        {
          content: 'Just finished my first marathon using a similar plan! The taper phase was the hardest — my brain kept telling me I wasn\'t doing enough.',
          postId: postMarathon.id,
          authorId: priya.id,
        },
        {
          content: 'The tip about 80% of runs being conversational pace is so important. I got injured my first attempt because I was running too hard on easy days.',
          postId: postMarathon.id,
          authorId: theodore.id,
        },

        // postUX comments
        {
          content: 'The section on progressive disclosure resonated so much. We redesigned our onboarding flow using this principle and saw a 35% increase in completion rates.',
          postId: postUX.id,
          authorId: theodore.id,
        },
        {
          content: 'Love this article! I\'d add that the Von Restorff Effect (things that stand out are remembered better) is also crucial for CTA design.',
          postId: postUX.id,
          authorId: sophie.id,
        },

        // postClimate comments
        {
          content: 'As someone working in renewable energy, I can confirm Green Hydrogen is the real deal. The EU investment is massive and the cost curve is dropping faster than expected.',
          postId: postClimate.id,
          authorId: elena.id,
        },
        {
          content: 'The seaweed farming section is new to me. Fascinating that it absorbs CO2 5x faster than forests. Going to research this more.',
          postId: postClimate.id,
          authorId: marco.id,
        },

        // postBeach comments
        {
          content: 'Gjipe Beach is my favorite place on Earth. We went by boat from Himarë and had the whole beach to ourselves in October.',
          postId: postBeach.id,
          authorId: sarah.id,
        },
        {
          content: 'Albania is incredible value right now. We spent two weeks on the Riviera for what one week in Croatia would cost.',
          postId: postBeach.id,
          authorId: alex.id,
        },

        // postSourdough comments
        {
          content: 'Week 3 of my sourdough journey thanks to this guide. My starter is finally doubling consistently! First real loaf this weekend.',
          postId: postSourdough.id,
          authorId: david.id,
        },

        // postBurnout comments
        {
          content: 'The "artificial commute" tip changed my life. I now take a 15-min walk around the block before opening my laptop. Such a simple change but it works.',
          postId: postBurnout.id,
          authorId: james.id,
        },
        {
          content: 'I experienced every single warning sign on this list before I realized I was burned out. Sharing this with my team.',
          postId: postBurnout.id,
          authorId: alex.id,
        },

        // postZeroWaste comments
        {
          content: 'Started composting with a bokashi bin after your recommendation. It\'s genuinely easy even in a small apartment. Highly recommend.',
          postId: postZeroWaste.id,
          authorId: priya.id,
        },
        {
          content: 'The safety razor switch was the best eco-swap I\'ve made. Better shave, zero plastic, and it pays for itself in 3 months.',
          postId: postZeroWaste.id,
          authorId: lina.id,
        },

        // postVegan comments
        {
          content: 'Made the mushroom bourguignon last night and my husband — a lifelong meat eater — asked for seconds. That\'s the highest compliment.',
          postId: postVegan.id,
          authorId: sophie.id,
        },

        // postSleep comments
        {
          content: 'The stat about 17 hours of wakefulness being equivalent to 0.05% BAC is terrifying. I\'m going to bed earlier tonight.',
          postId: postSleep.id,
          authorId: theodore.id,
        },
      ])
      .returning();

    // Now add some replies to existing comments
    const replyComments = await d
      .insert(comments)
      .values([
        {
          content: 'I think agents will augment at first, then gradually replace the simpler SaaS tools. Complex workflows will still need human oversight for a while.',
          postId: postAI.id,
          authorId: theodore.id,
          parentId: insertedComments[1].id, // reply to James' question
        },
        {
          content: 'Da Nang has improved a lot! Most cafés now have 50+ Mbps. I recommend staying near the Dragon Bridge area for the best connectivity.',
          postId: postNomad.id,
          authorId: james.id,
          parentId: insertedComments[6].id, // reply to Lina's question about Da Nang
        },
        {
          content: 'Drizzle if you want to be close to SQL and value lightweight bundles. Prisma if you want a more ORM-like experience with a GUI studio. Both are great.',
          postId: postNextjs.id,
          authorId: theodore.id,
          parentId: insertedComments[8].id, // reply to Lina's Drizzle vs Prisma question
        },
        {
          content: 'Totally agree! I nearly ruined my knees running 5:00/km on "easy" days. Now I run 6:30/km easy and my long runs actually feel strong.',
          postId: postMarathon.id,
          authorId: alex.id,
          parentId: insertedComments[10].id, // reply to Theodore's easy pace comment
        },
        {
          content: 'Yes! Von Restorff is underrated. We use contrasting colors for primary CTAs and it consistently outperforms uniform designs in A/B tests.',
          postId: postUX.id,
          authorId: lina.id,
          parentId: insertedComments[12].id, // reply to Sophie's Von Restorff comment
        },
      ])
      .returning();

    console.log(`✅ Created ${insertedComments.length + replyComments.length} comments (including ${replyComments.length} replies)\n`);

    // ═══════════════════════════════════════════════════════
    // 10. FOLLOWERS
    // ═══════════════════════════════════════════════════════
    console.log('👥 Creating follower relationships...');
    await d.insert(followers).values([
      // Theodore's followers — lots of tech readers
      { followerId: elena.id, followingId: theodore.id },
      { followerId: james.id, followingId: theodore.id },
      { followerId: lina.id, followingId: theodore.id },
      { followerId: david.id, followingId: theodore.id },
      { followerId: alex.id, followingId: theodore.id },

      // Elena's followers — food lovers
      { followerId: marco.id, followingId: elena.id },
      { followerId: sophie.id, followingId: elena.id },
      { followerId: priya.id, followingId: elena.id },
      { followerId: sarah.id, followingId: elena.id },

      // James' followers — travel community
      { followerId: sarah.id, followingId: james.id },
      { followerId: marco.id, followingId: james.id },
      { followerId: alex.id, followingId: james.id },
      { followerId: theodore.id, followingId: james.id },
      { followerId: elena.id, followingId: james.id },
      { followerId: lina.id, followingId: james.id },

      // Sarah's followers
      { followerId: james.id, followingId: sarah.id },
      { followerId: marco.id, followingId: sarah.id },
      { followerId: priya.id, followingId: sarah.id },

      // Marco's followers
      { followerId: elena.id, followingId: marco.id },
      { followerId: james.id, followingId: marco.id },
      { followerId: sophie.id, followingId: marco.id },

      // Priya's followers
      { followerId: elena.id, followingId: priya.id },
      { followerId: lina.id, followingId: priya.id },
      { followerId: david.id, followingId: priya.id },
      { followerId: sophie.id, followingId: priya.id },

      // Alex's followers
      { followerId: theodore.id, followingId: alex.id },
      { followerId: priya.id, followingId: alex.id },
      { followerId: marco.id, followingId: alex.id },

      // Lina's followers
      { followerId: theodore.id, followingId: lina.id },
      { followerId: sophie.id, followingId: lina.id },
      { followerId: james.id, followingId: lina.id },
      { followerId: david.id, followingId: lina.id },

      // David's followers
      { followerId: theodore.id, followingId: david.id },
      { followerId: priya.id, followingId: david.id },
      { followerId: lina.id, followingId: david.id },

      // Sophie's followers
      { followerId: lina.id, followingId: sophie.id },
      { followerId: elena.id, followingId: sophie.id },
      { followerId: marco.id, followingId: sophie.id },
      { followerId: david.id, followingId: sophie.id },
    ]);
    console.log('✅ Follower relationships created\n');

    // ═══════════════════════════════════════════════════════
    // 11. NOTIFICATIONS
    // ═══════════════════════════════════════════════════════
    console.log('🔔 Creating notifications...');
    await d.insert(notifications).values([
      // Like notifications
      {
        userId: theodore.id,
        actorId: elena.id,
        type: 'like',
        postId: postAI.id,
        message: 'Elena Martinez liked your post "The Future of AI: Trends Shaping 2026"',
        read: true,
      },
      {
        userId: theodore.id,
        actorId: james.id,
        type: 'like',
        postId: postAI.id,
        message: 'James Chen liked your post "The Future of AI: Trends Shaping 2026"',
        read: true,
      },
      {
        userId: theodore.id,
        actorId: lina.id,
        type: 'like',
        postId: postNextjs.id,
        message: 'Lina Nakamura liked your post "Building a Full-Stack App with Next.js and tRPC"',
        read: false,
      },
      {
        userId: elena.id,
        actorId: marco.id,
        type: 'like',
        postId: postAlps.id,
        message: 'Marco Rossi liked your post "Taste of the Alps: A Culinary Journey"',
        read: true,
      },
      {
        userId: elena.id,
        actorId: priya.id,
        type: 'like',
        postId: postSourdough.id,
        message: 'Priya Sharma liked your post "The Art of Sourdough: A Complete Guide"',
        read: false,
      },
      {
        userId: james.id,
        actorId: theodore.id,
        type: 'like',
        postId: postNomad.id,
        message: 'Theodore Reginald liked your post "Digital Nomad Guide to Southeast Asia"',
        read: true,
      },
      {
        userId: marco.id,
        actorId: elena.id,
        type: 'like',
        postId: postBeach.id,
        message: 'Elena Martinez liked your post "Hidden Beaches of the Mediterranean"',
        read: false,
      },
      {
        userId: lina.id,
        actorId: theodore.id,
        type: 'like',
        postId: postUX.id,
        message: 'Theodore Reginald liked your post "The Psychology of Great UX Design"',
        read: true,
      },
      {
        userId: david.id,
        actorId: elena.id,
        type: 'like',
        postId: postClimate.id,
        message: 'Elena Martinez liked your post "Climate Tech: Innovations That Give Us Hope"',
        read: false,
      },

      // Comment notifications
      {
        userId: theodore.id,
        actorId: lina.id,
        type: 'comment',
        postId: postAI.id,
        commentId: insertedComments[0].id,
        message: 'Lina Nakamura commented on your post "The Future of AI: Trends Shaping 2026"',
        read: true,
      },
      {
        userId: theodore.id,
        actorId: james.id,
        type: 'comment',
        postId: postAI.id,
        commentId: insertedComments[1].id,
        message: 'James Chen commented on your post "The Future of AI: Trends Shaping 2026"',
        read: false,
      },
      {
        userId: elena.id,
        actorId: marco.id,
        type: 'comment',
        postId: postAlps.id,
        commentId: insertedComments[3].id,
        message: 'Marco Rossi commented on your post "Taste of the Alps: A Culinary Journey"',
        read: true,
      },
      {
        userId: lina.id,
        actorId: theodore.id,
        type: 'comment',
        postId: postUX.id,
        commentId: insertedComments[11].id,
        message: 'Theodore Reginald commented on your post "The Psychology of Great UX Design"',
        read: false,
      },
      {
        userId: alex.id,
        actorId: priya.id,
        type: 'comment',
        postId: postMarathon.id,
        commentId: insertedComments[9].id,
        message: 'Priya Sharma commented on your post "Marathon Training for Beginners"',
        read: true,
      },
      {
        userId: david.id,
        actorId: elena.id,
        type: 'comment',
        postId: postClimate.id,
        commentId: insertedComments[13].id,
        message: 'Elena Martinez commented on your post "Climate Tech: Innovations That Give Us Hope"',
        read: false,
      },

      // Follow notifications
      {
        userId: theodore.id,
        actorId: elena.id,
        type: 'follow',
        message: 'Elena Martinez started following you',
        read: true,
      },
      {
        userId: theodore.id,
        actorId: lina.id,
        type: 'follow',
        message: 'Lina Nakamura started following you',
        read: true,
      },
      {
        userId: elena.id,
        actorId: marco.id,
        type: 'follow',
        message: 'Marco Rossi started following you',
        read: true,
      },
      {
        userId: james.id,
        actorId: sarah.id,
        type: 'follow',
        message: 'Sarah Johnson started following you',
        read: false,
      },
      {
        userId: lina.id,
        actorId: sophie.id,
        type: 'follow',
        message: 'Sophie Laurent started following you',
        read: false,
      },
      {
        userId: david.id,
        actorId: theodore.id,
        type: 'follow',
        message: 'Theodore Reginald started following you',
        read: true,
      },
      {
        userId: sophie.id,
        actorId: lina.id,
        type: 'follow',
        message: 'Lina Nakamura started following you',
        read: false,
      },
      {
        userId: priya.id,
        actorId: david.id,
        type: 'follow',
        message: 'David Okafor started following you',
        read: true,
      },
    ]);
    console.log('✅ Notifications created\n');

    console.log('════════════════════════════════════════════');
    console.log('🎉 Database seeding completed successfully!');
    console.log('════════════════════════════════════════════');
    console.log(`   Users:          ${insertedUsers.length}`);
    console.log(`   Categories:     ${insertedCategories.length}`);
    console.log(`   Tags:           ${insertedTags.length}`);
    console.log(`   Posts:          ${insertedPosts.length}`);
    console.log(`   Comments:       ${insertedComments.length + replyComments.length}`);
    console.log('   + likes, bookmarks, followers, notifications');
    console.log('════════════════════════════════════════════');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();