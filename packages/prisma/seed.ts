import { PrismaClient, Gender, VenueCategory } from './generated/client/index.js';
const prisma = new PrismaClient();

function generateRandomAlias() {
  const adjectives = ['Silent', 'Neon', 'Cosmic', 'Midnight', 'Electric', 'Phantom'];
  const nouns = ['Fox', 'Wolf', 'Hawk', 'Panther', 'Eagle', 'Tiger'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj}${noun}${num}`;
}

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Venues ──────────────────────────────────────────────────────────────
  const venues = await Promise.all([
    prisma.venue.upsert({
      where: { id: 'venue_1' },
      update: {},
      create: {
        id: 'venue_1',
        name: 'The Blue Brew Café',
        address: '12 MG Road, Bengaluru, Karnataka 560001',
        lat: 12.9716,
        lng: 77.5946,
        category: VenueCategory.CAFE,
        isActive: true,
        tables: {
          create: [
            { label: 'Table 1' },
            { label: 'Table 2' },
            { label: 'Table 3' },
            { label: 'Bar Seat 1' },
            { label: 'Bar Seat 2' },
          ],
        },
      },
    }),
    prisma.venue.upsert({
      where: { id: 'venue_2' },
      update: {},
      create: {
        id: 'venue_2',
        name: 'Neon Lounge',
        address: '45 Indiranagar, Bengaluru, Karnataka 560038',
        lat: 12.9784,
        lng: 77.6408,
        category: VenueCategory.LOUNGE,
        isActive: true,
        tables: {
          create: [
            { label: 'Table A' },
            { label: 'Table B' },
            { label: 'VIP Corner' },
          ],
        },
      },
    }),
    prisma.venue.upsert({
      where: { id: 'venue_3' },
      update: {},
      create: {
        id: 'venue_3',
        name: 'Ember & Co.',
        address: '8 Koramangala 5th Block, Bengaluru, Karnataka 560095',
        lat: 12.9352,
        lng: 77.6245,
        category: VenueCategory.BAR,
        isActive: true,
        tables: {
          create: [
            { label: 'Table 1' },
            { label: 'Table 2' },
            { label: 'Rooftop 1' },
            { label: 'Rooftop 2' },
          ],
        },
      },
    }),
    prisma.venue.upsert({
      where: { id: 'venue_4' },
      update: {},
      create: {
        id: 'venue_4',
        name: 'The Sonipat Sip',
        address: 'Sector 14, Sonipat, Haryana 131001',
        lat: 28.9931,
        lng: 77.0151,
        category: VenueCategory.CAFE,
        isActive: true,
        tables: {
          create: [{ label: 'Table 1' }, { label: 'Table 2' }],
        },
      },
    }),
    prisma.venue.upsert({
      where: { id: 'venue_5' },
      update: {},
      create: {
        id: 'venue_5',
        name: 'Connaught Central',
        address: 'Connaught Place, New Delhi 110001',
        lat: 28.6315,
        lng: 77.2167,
        category: VenueCategory.RESTAURANT,
        isActive: true,
        tables: {
          create: [{ label: 'Table A' }, { label: 'Table B' }, { label: 'VIP' }],
        },
      },
    }),
    prisma.venue.upsert({
      where: { id: 'venue_6' },
      update: {},
      create: {
        id: 'venue_6',
        name: 'Marine Drive Mixers',
        address: 'Marine Drive, Mumbai, Maharashtra 400020',
        lat: 18.9440,
        lng: 72.8238,
        category: VenueCategory.LOUNGE,
        isActive: true,
        tables: {
          create: [{ label: 'Deck 1' }, { label: 'Deck 2' }, { label: 'Deck 3' }],
        },
      },
    }),
    prisma.venue.upsert({
      where: { id: 'venue_7' },
      update: {},
      create: {
        id: 'venue_7',
        name: 'Sector 17 Social',
        address: 'Sector 17, Chandigarh 160017',
        lat: 30.7398,
        lng: 76.7827,
        category: VenueCategory.BAR,
        isActive: true,
        tables: {
          create: [{ label: 'Booth 1' }, { label: 'Booth 2' }],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${venues.length} venues`);

  // ─── Admin User ───────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { phone: '+910000000000' },
    update: {},
    create: {
      phone: '+910000000000',
      alias: 'AdminCliq',
      avatarSeed: 'admin_seed_001',
      gender: Gender.PREFER_NOT_TO_SAY,
      isAdmin: true,
    },
  });

  console.log(`✅ Created admin user: ${admin.alias}`);

  // ─── Sample Users ─────────────────────────────────────────────────────────
  const sampleUsers = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.user.upsert({
        where: { phone: `+9199999000${i + 1}` },
        update: {},
        create: {
          phone: `+9199999000${i + 1}`,
          alias: generateRandomAlias(),
          avatarSeed: `seed_${i + 1}`,
          gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        },
      })
    )
  );

  console.log(`✅ Created ${sampleUsers.length} sample users`);
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
