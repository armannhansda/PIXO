/**
 * Database Seed Script (Node.js version)
 * Seeds the database with users, posts, categories, tags, likes, bookmarks,
 * comments (with replies), followers, and notifications.
 */

const postgres = require('postgres');
require('dotenv').config();

async function seed() {
  try {
    console.log('🌱 Seeding database...\n');

    const sql = postgres({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'blogplatform',
      ssl: process.env.DB_SSL === 'true',
    });

    // ── Clear existing data ──
    console.log('🗑️  Clearing existing data...');
    await sql`DELETE FROM notifications`;
    await sql`DELETE FROM followers`;
    await sql`DELETE FROM comments`;
    await sql`DELETE FROM bookmarks`;
    await sql`DELETE FROM likes`;
    await sql`DELETE FROM posts_to_tags`;
    await sql`DELETE FROM posts_to_categories`;
    await sql`DELETE FROM posts`;
    await sql`DELETE FROM tags`;
    await sql`DELETE FROM categories`;
    await sql`DELETE FROM users`;
    console.log('✅ Existing data cleared\n');

    // ═══════════════════════════════════════════
    // 1. USERS
    // ═══════════════════════════════════════════
    // Pre-hashed password for all seed users: "Password123"
    const hashedPassword = '$2b$10$vqYw4DybyjQUAmLWPYuen.WEgt8bstgpC712YiLfWkYdaB0w.qY46';

    console.log('👥 Creating users...');
    const authors = await sql`
      INSERT INTO users (name, username, email, password, role, bio, location, profile_image) VALUES
      ('Theodore Reginald', 'theodore', 'theodore@example.com', ${hashedPassword}, 'admin',
       'Full-stack developer and open-source enthusiast. Writing about technology, startups, and the future of the web.',
       'San Francisco, CA', 'https://i.pravatar.cc/300?u=theodore'),
      ('Elena Martinez', 'elena', 'elena@example.com', ${hashedPassword}, 'author',
       'Food writer and culinary explorer. Passionate about discovering authentic flavors from every corner of the world.',
       'Barcelona, Spain', 'https://i.pravatar.cc/300?u=elena'),
      ('James Chen', 'james', 'james@example.com', ${hashedPassword}, 'author',
       'Digital nomad, photographer, and travel storyteller. Currently somewhere in Southeast Asia with a laptop and a camera.',
       'Chiang Mai, Thailand', 'https://i.pravatar.cc/300?u=james'),
      ('Sarah Johnson', 'sarah', 'sarah@example.com', ${hashedPassword}, 'author',
       'Budget travel expert and finance blogger. Proving that you don''t need a fortune to see the world.',
       'Austin, TX', 'https://i.pravatar.cc/300?u=sarah'),
      ('Marco Rossi', 'marco', 'marco@example.com', ${hashedPassword}, 'author',
       'Mediterranean lifestyle writer and sailing enthusiast. Covering hidden gems along the European coast.',
       'Naples, Italy', 'https://i.pravatar.cc/300?u=marco'),
      ('Priya Sharma', 'priya', 'priya@example.com', ${hashedPassword}, 'author',
       'Wellness coach, yoga instructor, and mindfulness advocate. Helping people find balance in a busy world.',
       'Mumbai, India', 'https://i.pravatar.cc/300?u=priya'),
      ('Alex Rivera', 'alex', 'alex@example.com', ${hashedPassword}, 'author',
       'Sports journalist and marathon runner. Covering global athletics and the stories behind the athletes.',
       'Mexico City, Mexico', 'https://i.pravatar.cc/300?u=alex'),
      ('Lina Nakamura', 'lina', 'lina@example.com', ${hashedPassword}, 'author',
       'UX designer turned writer. Exploring the intersection of design, technology, and human behavior.',
       'Tokyo, Japan', 'https://i.pravatar.cc/300?u=lina'),
      ('David Okafor', 'david', 'david@example.com', ${hashedPassword}, 'author',
       'Environmental scientist and sustainability advocate. Writing about climate action and green innovation.',
       'Lagos, Nigeria', 'https://i.pravatar.cc/300?u=david'),
      ('Sophie Laurent', 'sophie', 'sophie@example.com', ${hashedPassword}, 'author',
       'Art critic and gallery curator. Passionate about contemporary art, street art, and emerging creative voices.',
       'Paris, France', 'https://i.pravatar.cc/300?u=sophie')
      RETURNING id, name
    `;
    const u = {};
    authors.forEach(a => { u[a.name] = a.id; });
    console.log(`✅ Created ${authors.length} users\n`);

    // ═══════════════════════════════════════════
    // 2. CATEGORIES
    // ═══════════════════════════════════════════
    console.log('📂 Creating categories...');
    const cats = await sql`
      INSERT INTO categories (name, slug, description) VALUES
      ('Technology', 'technology', 'Latest tech news, software development, and digital innovation'),
      ('Travel', 'travel', 'Travel guides, destination recommendations, and adventure stories'),
      ('Food & Drink', 'food-drink', 'Culinary experiences, recipes, and restaurant reviews'),
      ('Lifestyle', 'lifestyle', 'Wellness, productivity, and personal development'),
      ('Business', 'business', 'Startups, entrepreneurship, and career insights'),
      ('Science', 'science', 'Scientific discoveries, research, and the natural world'),
      ('Design & Art', 'design-art', 'Graphic design, fine art, architecture, and creative inspiration'),
      ('Sports & Fitness', 'sports-fitness', 'Athletics, workout routines, and sports coverage'),
      ('Finance', 'finance', 'Personal finance, investing, and economic trends'),
      ('Entertainment', 'entertainment', 'Movies, music, gaming, and pop culture'),
      ('Education', 'education', 'Learning resources, tutorials, and academic topics'),
      ('Environment', 'environment', 'Sustainability, climate change, and green living'),
      ('Health', 'health', 'Physical and mental health, nutrition, and medical breakthroughs'),
      ('Photography', 'photography', 'Photography techniques, gear reviews, and visual storytelling'),
      ('Remote Work', 'remote-work', 'Working remotely, digital nomad life, and distributed teams')
      RETURNING id, slug
    `;
    const c = {};
    cats.forEach(cat => { c[cat.slug] = cat.id; });
    console.log(`✅ Created ${cats.length} categories\n`);

    // ═══════════════════════════════════════════
    // 3. TAGS
    // ═══════════════════════════════════════════
    console.log('🏷️  Creating tags...');
    const tagRows = await sql`
      INSERT INTO tags (name, slug) VALUES
      ('JavaScript', 'javascript'), ('React', 'react'), ('Next.js', 'nextjs'),
      ('TypeScript', 'typescript'), ('Python', 'python'), ('AI', 'ai'),
      ('Machine Learning', 'machine-learning'), ('Web Development', 'web-development'),
      ('CSS', 'css'), ('Node.js', 'nodejs'), ('Backpacking', 'backpacking'),
      ('Budget Travel', 'budget-travel'), ('Solo Travel', 'solo-travel'),
      ('Hiking', 'hiking'), ('Beach', 'beach'), ('Street Food', 'street-food'),
      ('Recipes', 'recipes'), ('Vegan', 'vegan'), ('Coffee', 'coffee'),
      ('Wine', 'wine'), ('Yoga', 'yoga'), ('Meditation', 'meditation'),
      ('Productivity', 'productivity'), ('Minimalism', 'minimalism'),
      ('Running', 'running'), ('Photography Tips', 'photography-tips'),
      ('Sustainability', 'sustainability'), ('Climate Change', 'climate-change'),
      ('Startups', 'startups'), ('Investing', 'investing'),
      ('UX Design', 'ux-design'), ('Freelancing', 'freelancing'),
      ('Mental Health', 'mental-health'), ('Nutrition', 'nutrition'),
      ('Science Fiction', 'science-fiction')
      RETURNING id, slug
    `;
    const t = {};
    tagRows.forEach(tag => { t[tag.slug] = tag.id; });
    console.log(`✅ Created ${tagRows.length} tags\n`);

    // ═══════════════════════════════════════════
    // 4. POSTS
    // ═══════════════════════════════════════════
    console.log('📝 Creating posts...');
    const postsData = require('./detailed_posts.js')(u);

    const postIds = {};
    for (const p of postsData) {
      const [row] = await sql`
        INSERT INTO posts (title, slug, excerpt, content, published, author_id, cover_image)
        VALUES (${p.title}, ${p.slug}, ${p.excerpt}, ${p.content}, true, ${p.authorId}, ${p.cover})
        RETURNING id
      `;
      postIds[p.slug] = { id: row.id, cats: p.cats, tags: p.tags };
    }
    console.log(`✅ Created ${postsData.length} posts\n`);

    // ═══════════════════════════════════════════
    // 5. POST → CATEGORY LINKS
    // ═══════════════════════════════════════════
    console.log('🔗 Linking posts to categories...');
    for (const slug of Object.keys(postIds)) {
      const p = postIds[slug];
      for (const catSlug of p.cats) {
        await sql`INSERT INTO posts_to_categories (post_id, category_id) VALUES (${p.id}, ${c[catSlug]})`;
      }
    }
    console.log('✅ Post-category links created\n');

    // ═══════════════════════════════════════════
    // 6. POST → TAG LINKS
    // ═══════════════════════════════════════════
    console.log('🏷️  Linking posts to tags...');
    for (const slug of Object.keys(postIds)) {
      const p = postIds[slug];
      for (const tagSlug of p.tags) {
        await sql`INSERT INTO posts_to_tags (post_id, tag_id) VALUES (${p.id}, ${t[tagSlug]})`;
      }
    }
    console.log('✅ Post-tag links created\n');

    // Helper shorthand
    const pid = (slug) => postIds[slug].id;

    // ═══════════════════════════════════════════
    // 7. LIKES
    // ═══════════════════════════════════════════
    console.log('❤️  Creating likes...');
    const likesData = [
      [u['Elena Martinez'], pid('future-of-ai-trends-2026')],
      [u['James Chen'], pid('future-of-ai-trends-2026')],
      [u['Sarah Johnson'], pid('future-of-ai-trends-2026')],
      [u['Lina Nakamura'], pid('future-of-ai-trends-2026')],
      [u['David Okafor'], pid('future-of-ai-trends-2026')],
      [u['Sophie Laurent'], pid('future-of-ai-trends-2026')],
      [u['Theodore Reginald'], pid('taste-alps-culinary-journey')],
      [u['Marco Rossi'], pid('taste-alps-culinary-journey')],
      [u['Priya Sharma'], pid('taste-alps-culinary-journey')],
      [u['Sophie Laurent'], pid('taste-alps-culinary-journey')],
      [u['Theodore Reginald'], pid('digital-nomad-southeast-asia')],
      [u['Elena Martinez'], pid('digital-nomad-southeast-asia')],
      [u['Sarah Johnson'], pid('digital-nomad-southeast-asia')],
      [u['Alex Rivera'], pid('digital-nomad-southeast-asia')],
      [u['Lina Nakamura'], pid('digital-nomad-southeast-asia')],
      [u['James Chen'], pid('budget-travel-hacks-that-work')],
      [u['Marco Rossi'], pid('budget-travel-hacks-that-work')],
      [u['Priya Sharma'], pid('budget-travel-hacks-that-work')],
      [u['Elena Martinez'], pid('hidden-beaches-mediterranean')],
      [u['James Chen'], pid('hidden-beaches-mediterranean')],
      [u['Sarah Johnson'], pid('hidden-beaches-mediterranean')],
      [u['Priya Sharma'], pid('hidden-beaches-mediterranean')],
      [u['Alex Rivera'], pid('hidden-beaches-mediterranean')],
      [u['Sophie Laurent'], pid('hidden-beaches-mediterranean')],
      [u['Elena Martinez'], pid('wellness-retreats-finding-zen')],
      [u['Lina Nakamura'], pid('wellness-retreats-finding-zen')],
      [u['David Okafor'], pid('wellness-retreats-finding-zen')],
      [u['James Chen'], pid('fullstack-nextjs-trpc')],
      [u['Lina Nakamura'], pid('fullstack-nextjs-trpc')],
      [u['David Okafor'], pid('fullstack-nextjs-trpc')],
      [u['Alex Rivera'], pid('fullstack-nextjs-trpc')],
      [u['Theodore Reginald'], pid('marathon-training-beginners')],
      [u['Sarah Johnson'], pid('marathon-training-beginners')],
      [u['Priya Sharma'], pid('marathon-training-beginners')],
      [u['David Okafor'], pid('marathon-training-beginners')],
      [u['Theodore Reginald'], pid('psychology-great-ux-design')],
      [u['Elena Martinez'], pid('psychology-great-ux-design')],
      [u['James Chen'], pid('psychology-great-ux-design')],
      [u['Alex Rivera'], pid('psychology-great-ux-design')],
      [u['Sophie Laurent'], pid('psychology-great-ux-design')],
      [u['Theodore Reginald'], pid('climate-tech-innovations-hope')],
      [u['Elena Martinez'], pid('climate-tech-innovations-hope')],
      [u['Priya Sharma'], pid('climate-tech-innovations-hope')],
      [u['Lina Nakamura'], pid('climate-tech-innovations-hope')],
      [u['Sophie Laurent'], pid('climate-tech-innovations-hope')],
      [u['Marco Rossi'], pid('street-art-revolution')],
      [u['Lina Nakamura'], pid('street-art-revolution')],
      [u['David Okafor'], pid('street-art-revolution')],
      [u['Marco Rossi'], pid('hiking-wonders-patagonia')],
      [u['Alex Rivera'], pid('hiking-wonders-patagonia')],
      [u['Sarah Johnson'], pid('hiking-wonders-patagonia')],
      [u['Sophie Laurent'], pid('hiking-wonders-patagonia')],
      [u['Theodore Reginald'], pid('investing-millennials-wealth-30s')],
      [u['Marco Rossi'], pid('investing-millennials-wealth-30s')],
      [u['James Chen'], pid('investing-millennials-wealth-30s')],
      [u['Marco Rossi'], pid('art-of-sourdough-guide')],
      [u['Priya Sharma'], pid('art-of-sourdough-guide')],
      [u['Lina Nakamura'], pid('art-of-sourdough-guide')],
      [u['Sophie Laurent'], pid('art-of-sourdough-guide')],
      [u['David Okafor'], pid('art-of-sourdough-guide')],
      [u['Theodore Reginald'], pid('remote-work-burnout-solutions')],
      [u['James Chen'], pid('remote-work-burnout-solutions')],
      [u['Alex Rivera'], pid('remote-work-burnout-solutions')],
      [u['David Okafor'], pid('remote-work-burnout-solutions')],
      [u['Priya Sharma'], pid('vegan-comfort-food-recipes')],
      [u['David Okafor'], pid('vegan-comfort-food-recipes')],
      [u['Sophie Laurent'], pid('vegan-comfort-food-recipes')],
      [u['Theodore Reginald'], pid('science-of-sleep')],
      [u['Elena Martinez'], pid('science-of-sleep')],
      [u['Alex Rivera'], pid('science-of-sleep')],
      [u['Lina Nakamura'], pid('science-of-sleep')],
      [u['James Chen'], pid('css-2026-whats-new')],
      [u['Lina Nakamura'], pid('css-2026-whats-new')],
      [u['David Okafor'], pid('css-2026-whats-new')],
      [u['Elena Martinez'], pid('zero-waste-living-starter-guide')],
      [u['Priya Sharma'], pid('zero-waste-living-starter-guide')],
      [u['Sophie Laurent'], pid('zero-waste-living-starter-guide')],
      [u['Alex Rivera'], pid('zero-waste-living-starter-guide')],
      [u['Lina Nakamura'], pid('zero-waste-living-starter-guide')],
    ];
    for (const [userId, postId] of likesData) {
      await sql`INSERT INTO likes (user_id, post_id) VALUES (${userId}, ${postId})`;
    }
    console.log(`✅ Created ${likesData.length} likes\n`);

    // ═══════════════════════════════════════════
    // 8. BOOKMARKS
    // ═══════════════════════════════════════════
    console.log('🔖 Creating bookmarks...');
    const bookmarksData = [
      [u['Theodore Reginald'], pid('climate-tech-innovations-hope')],
      [u['Theodore Reginald'], pid('psychology-great-ux-design')],
      [u['Elena Martinez'], pid('art-of-sourdough-guide')],
      [u['Elena Martinez'], pid('vegan-comfort-food-recipes')],
      [u['Elena Martinez'], pid('digital-nomad-southeast-asia')],
      [u['James Chen'], pid('future-of-ai-trends-2026')],
      [u['James Chen'], pid('fullstack-nextjs-trpc')],
      [u['James Chen'], pid('hidden-beaches-mediterranean')],
      [u['Sarah Johnson'], pid('investing-millennials-wealth-30s')],
      [u['Sarah Johnson'], pid('remote-work-burnout-solutions')],
      [u['Sarah Johnson'], pid('marathon-training-beginners')],
      [u['Marco Rossi'], pid('taste-alps-culinary-journey')],
      [u['Marco Rossi'], pid('hiking-wonders-patagonia')],
      [u['Priya Sharma'], pid('science-of-sleep')],
      [u['Priya Sharma'], pid('wellness-retreats-finding-zen')],
      [u['Priya Sharma'], pid('zero-waste-living-starter-guide')],
      [u['Alex Rivera'], pid('marathon-training-beginners')],
      [u['Alex Rivera'], pid('hiking-wonders-patagonia')],
      [u['Lina Nakamura'], pid('css-2026-whats-new')],
      [u['Lina Nakamura'], pid('psychology-great-ux-design')],
      [u['Lina Nakamura'], pid('street-art-revolution')],
      [u['David Okafor'], pid('climate-tech-innovations-hope')],
      [u['David Okafor'], pid('zero-waste-living-starter-guide')],
      [u['Sophie Laurent'], pid('street-art-revolution')],
      [u['Sophie Laurent'], pid('mastering-street-food-photography')],
    ];
    for (const [userId, postId] of bookmarksData) {
      await sql`INSERT INTO bookmarks (user_id, post_id) VALUES (${userId}, ${postId})`;
    }
    console.log(`✅ Created ${bookmarksData.length} bookmarks\n`);

    // ═══════════════════════════════════════════
    // 9. COMMENTS (with nested replies)
    // ═══════════════════════════════════════════
    console.log('💬 Creating comments...');
    const commentsData = [
      { content: 'Fantastic overview. The section on autonomous agents is spot on!', postSlug: 'future-of-ai-trends-2026', author: 'Lina Nakamura' },
      { content: 'Great article! Do you think autonomous agents will replace traditional SaaS tools?', postSlug: 'future-of-ai-trends-2026', author: 'James Chen' },
      { content: 'The healthcare stats are impressive. AI-assisted screening is a game changer.', postSlug: 'future-of-ai-trends-2026', author: 'Sarah Johnson' },
      { content: 'I visited Kronenhütte last winter and it was incredible!', postSlug: 'taste-alps-culinary-journey', author: 'Marco Rossi' },
      { content: 'You forgot Kaiserschmarrn — the best Austrian dessert!', postSlug: 'taste-alps-culinary-journey', author: 'Sophie Laurent' },
      { content: 'I\'ve been in Chiang Mai for 3 months — also check out Yellow co-working.', postSlug: 'digital-nomad-southeast-asia', author: 'Alex Rivera' },
      { content: 'How\'s the internet in Da Nang these days? I had issues in 2024.', postSlug: 'digital-nomad-southeast-asia', author: 'Lina Nakamura' },
      { content: 'tRPC changed how I think about APIs. The TypeScript inference is magical.', postSlug: 'fullstack-nextjs-trpc', author: 'David Okafor' },
      { content: 'Would you recommend Drizzle ORM over Prisma?', postSlug: 'fullstack-nextjs-trpc', author: 'Lina Nakamura' },
      { content: 'Just finished my first marathon using a similar plan!', postSlug: 'marathon-training-beginners', author: 'Priya Sharma' },
      { content: 'The tip about 80% conversational pace is so important. I got injured ignoring it.', postSlug: 'marathon-training-beginners', author: 'Theodore Reginald' },
      { content: 'Progressive disclosure resonated so much. We saw a 35% increase in completion rates.', postSlug: 'psychology-great-ux-design', author: 'Theodore Reginald' },
      { content: 'Love this! The Von Restorff Effect is also crucial for CTA design.', postSlug: 'psychology-great-ux-design', author: 'Sophie Laurent' },
      { content: 'Green Hydrogen is the real deal. The cost curve is dropping faster than expected.', postSlug: 'climate-tech-innovations-hope', author: 'Elena Martinez' },
      { content: 'The seaweed farming section is fascinating. Going to research this more.', postSlug: 'climate-tech-innovations-hope', author: 'Marco Rossi' },
      { content: 'Gjipe Beach is my favorite place on Earth!', postSlug: 'hidden-beaches-mediterranean', author: 'Sarah Johnson' },
      { content: 'Albania is incredible value right now.', postSlug: 'hidden-beaches-mediterranean', author: 'Alex Rivera' },
      { content: 'Week 3 of my sourdough journey thanks to this guide!', postSlug: 'art-of-sourdough-guide', author: 'David Okafor' },
      { content: 'The "artificial commute" tip changed my life.', postSlug: 'remote-work-burnout-solutions', author: 'James Chen' },
      { content: 'I experienced every warning sign before I realized I was burned out.', postSlug: 'remote-work-burnout-solutions', author: 'Alex Rivera' },
      { content: 'Started composting with a bokashi bin — easy even in a small apartment.', postSlug: 'zero-waste-living-starter-guide', author: 'Priya Sharma' },
      { content: 'The safety razor switch was the best eco-swap I\'ve made.', postSlug: 'zero-waste-living-starter-guide', author: 'Lina Nakamura' },
      { content: 'Made the mushroom bourguignon — my meat-eating husband asked for seconds!', postSlug: 'vegan-comfort-food-recipes', author: 'Sophie Laurent' },
      { content: 'The 17-hours-awake stat is terrifying. Going to bed earlier tonight.', postSlug: 'science-of-sleep', author: 'Theodore Reginald' },
    ];

    const commentIds = [];
    for (const cm of commentsData) {
      const [row] = await sql`
        INSERT INTO comments (content, post_id, author_id)
        VALUES (${cm.content}, ${pid(cm.postSlug)}, ${u[cm.author]})
        RETURNING id
      `;
      commentIds.push(row.id);
    }

    // Replies
    const repliesData = [
      { content: 'Agents will augment first, then gradually replace simpler SaaS tools.', postSlug: 'future-of-ai-trends-2026', author: 'Theodore Reginald', parentIdx: 1 },
      { content: 'Da Nang has improved! Most cafés now have 50+ Mbps.', postSlug: 'digital-nomad-southeast-asia', author: 'James Chen', parentIdx: 6 },
      { content: 'Drizzle if you want to be close to SQL, Prisma for a more ORM-like experience. Both are great.', postSlug: 'fullstack-nextjs-trpc', author: 'Theodore Reginald', parentIdx: 8 },
      { content: 'Totally agree! I run 6:30/km easy now and my long runs feel strong.', postSlug: 'marathon-training-beginners', author: 'Alex Rivera', parentIdx: 10 },
      { content: 'Von Restorff is underrated! Contrasting CTA colors consistently win A/B tests.', postSlug: 'psychology-great-ux-design', author: 'Lina Nakamura', parentIdx: 12 },
    ];

    for (const r of repliesData) {
      await sql`
        INSERT INTO comments (content, post_id, author_id, parent_id)
        VALUES (${r.content}, ${pid(r.postSlug)}, ${u[r.author]}, ${commentIds[r.parentIdx]})
      `;
    }
    console.log(`✅ Created ${commentsData.length + repliesData.length} comments (${repliesData.length} replies)\n`);

    // ═══════════════════════════════════════════
    // 10. FOLLOWERS
    // ═══════════════════════════════════════════
    console.log('👥 Creating follower relationships...');
    const followsData = [
      ['Elena Martinez', 'Theodore Reginald'], ['James Chen', 'Theodore Reginald'],
      ['Lina Nakamura', 'Theodore Reginald'], ['David Okafor', 'Theodore Reginald'],
      ['Alex Rivera', 'Theodore Reginald'],
      ['Marco Rossi', 'Elena Martinez'], ['Sophie Laurent', 'Elena Martinez'],
      ['Priya Sharma', 'Elena Martinez'], ['Sarah Johnson', 'Elena Martinez'],
      ['Sarah Johnson', 'James Chen'], ['Marco Rossi', 'James Chen'],
      ['Alex Rivera', 'James Chen'], ['Theodore Reginald', 'James Chen'],
      ['Elena Martinez', 'James Chen'], ['Lina Nakamura', 'James Chen'],
      ['James Chen', 'Sarah Johnson'], ['Marco Rossi', 'Sarah Johnson'],
      ['Priya Sharma', 'Sarah Johnson'],
      ['Elena Martinez', 'Marco Rossi'], ['James Chen', 'Marco Rossi'],
      ['Sophie Laurent', 'Marco Rossi'],
      ['Elena Martinez', 'Priya Sharma'], ['Lina Nakamura', 'Priya Sharma'],
      ['David Okafor', 'Priya Sharma'], ['Sophie Laurent', 'Priya Sharma'],
      ['Theodore Reginald', 'Alex Rivera'], ['Priya Sharma', 'Alex Rivera'],
      ['Marco Rossi', 'Alex Rivera'],
      ['Theodore Reginald', 'Lina Nakamura'], ['Sophie Laurent', 'Lina Nakamura'],
      ['James Chen', 'Lina Nakamura'], ['David Okafor', 'Lina Nakamura'],
      ['Theodore Reginald', 'David Okafor'], ['Priya Sharma', 'David Okafor'],
      ['Lina Nakamura', 'David Okafor'],
      ['Lina Nakamura', 'Sophie Laurent'], ['Elena Martinez', 'Sophie Laurent'],
      ['Marco Rossi', 'Sophie Laurent'], ['David Okafor', 'Sophie Laurent'],
    ];
    for (const [follower, following] of followsData) {
      await sql`INSERT INTO followers (follower_id, following_id) VALUES (${u[follower]}, ${u[following]})`;
    }
    console.log(`✅ Created ${followsData.length} follower relationships\n`);

    // ═══════════════════════════════════════════
    // 11. NOTIFICATIONS
    // ═══════════════════════════════════════════
    console.log('🔔 Creating notifications...');
    const notifsData = [
      { userId: u['Theodore Reginald'], actorId: u['Elena Martinez'], type: 'like', postId: pid('future-of-ai-trends-2026'), message: 'Elena Martinez liked your post "The Future of AI"', read: true },
      { userId: u['Theodore Reginald'], actorId: u['James Chen'], type: 'like', postId: pid('future-of-ai-trends-2026'), message: 'James Chen liked your post "The Future of AI"', read: true },
      { userId: u['Theodore Reginald'], actorId: u['Lina Nakamura'], type: 'like', postId: pid('fullstack-nextjs-trpc'), message: 'Lina Nakamura liked your post "Building a Full-Stack App"', read: false },
      { userId: u['Elena Martinez'], actorId: u['Marco Rossi'], type: 'like', postId: pid('taste-alps-culinary-journey'), message: 'Marco Rossi liked your post "Taste of the Alps"', read: true },
      { userId: u['Elena Martinez'], actorId: u['Priya Sharma'], type: 'like', postId: pid('art-of-sourdough-guide'), message: 'Priya Sharma liked your post "The Art of Sourdough"', read: false },
      { userId: u['James Chen'], actorId: u['Theodore Reginald'], type: 'like', postId: pid('digital-nomad-southeast-asia'), message: 'Theodore Reginald liked your post "Digital Nomad Guide"', read: true },
      { userId: u['Marco Rossi'], actorId: u['Elena Martinez'], type: 'like', postId: pid('hidden-beaches-mediterranean'), message: 'Elena Martinez liked your post "Hidden Beaches"', read: false },
      { userId: u['Lina Nakamura'], actorId: u['Theodore Reginald'], type: 'like', postId: pid('psychology-great-ux-design'), message: 'Theodore Reginald liked your post "The Psychology of Great UX"', read: true },
      { userId: u['David Okafor'], actorId: u['Elena Martinez'], type: 'like', postId: pid('climate-tech-innovations-hope'), message: 'Elena Martinez liked your post "Climate Tech"', read: false },
      { userId: u['Theodore Reginald'], actorId: u['Lina Nakamura'], type: 'comment', postId: pid('future-of-ai-trends-2026'), commentId: commentIds[0], message: 'Lina Nakamura commented on "The Future of AI"', read: true },
      { userId: u['Theodore Reginald'], actorId: u['James Chen'], type: 'comment', postId: pid('future-of-ai-trends-2026'), commentId: commentIds[1], message: 'James Chen commented on "The Future of AI"', read: false },
      { userId: u['Elena Martinez'], actorId: u['Marco Rossi'], type: 'comment', postId: pid('taste-alps-culinary-journey'), commentId: commentIds[3], message: 'Marco Rossi commented on "Taste of the Alps"', read: true },
      { userId: u['Lina Nakamura'], actorId: u['Theodore Reginald'], type: 'comment', postId: pid('psychology-great-ux-design'), commentId: commentIds[11], message: 'Theodore Reginald commented on "The Psychology of Great UX"', read: false },
      { userId: u['Alex Rivera'], actorId: u['Priya Sharma'], type: 'comment', postId: pid('marathon-training-beginners'), commentId: commentIds[9], message: 'Priya Sharma commented on "Marathon Training"', read: true },
      { userId: u['David Okafor'], actorId: u['Elena Martinez'], type: 'comment', postId: pid('climate-tech-innovations-hope'), commentId: commentIds[13], message: 'Elena Martinez commented on "Climate Tech"', read: false },
      { userId: u['Theodore Reginald'], actorId: u['Elena Martinez'], type: 'follow', message: 'Elena Martinez started following you', read: true },
      { userId: u['Theodore Reginald'], actorId: u['Lina Nakamura'], type: 'follow', message: 'Lina Nakamura started following you', read: true },
      { userId: u['Elena Martinez'], actorId: u['Marco Rossi'], type: 'follow', message: 'Marco Rossi started following you', read: true },
      { userId: u['James Chen'], actorId: u['Sarah Johnson'], type: 'follow', message: 'Sarah Johnson started following you', read: false },
      { userId: u['Lina Nakamura'], actorId: u['Sophie Laurent'], type: 'follow', message: 'Sophie Laurent started following you', read: false },
      { userId: u['David Okafor'], actorId: u['Theodore Reginald'], type: 'follow', message: 'Theodore Reginald started following you', read: true },
      { userId: u['Sophie Laurent'], actorId: u['Lina Nakamura'], type: 'follow', message: 'Lina Nakamura started following you', read: false },
      { userId: u['Priya Sharma'], actorId: u['David Okafor'], type: 'follow', message: 'David Okafor started following you', read: true },
    ];
    for (const n of notifsData) {
      await sql`
        INSERT INTO notifications (user_id, actor_id, type, post_id, comment_id, message, read)
        VALUES (${n.userId}, ${n.actorId}, ${n.type}, ${n.postId || null}, ${n.commentId || null}, ${n.message}, ${n.read})
      `;
    }
    console.log(`✅ Created ${notifsData.length} notifications\n`);

    // ═══════════════════════════════════════════
    console.log('════════════════════════════════════════════');
    console.log('🎉 Database seeding completed successfully!');
    console.log('════════════════════════════════════════════');
    console.log(`   Users:          10`);
    console.log(`   Categories:     15`);
    console.log(`   Tags:           35`);
    console.log(`   Posts:          20`);
    console.log(`   Comments:       29`);
    console.log('   + likes, bookmarks, followers, notifications');
    console.log('════════════════════════════════════════════');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message || error);
    process.exit(1);
  }
}

seed();
