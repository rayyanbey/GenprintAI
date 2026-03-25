import { models } from '../src/db/db.js';
import { nanoid } from 'nanoid';

async function seedTemplates() {
  try {
    console.log('📝 Seeding templates...\n');

    const { Template } = models as any;

    const templates = [
      // Apparel templates
      {
        id: nanoid(),
        name: 'Classic Logo',
        category: 'apparel',
        description: 'Simple centered logo placement',
        color_variants: [
          { name: 'Red', hex: '#FF0000' },
          { name: 'Blue', hex: '#0000FF' },
          { name: 'Black', hex: '#000000' },
        ],
        approval_status: 'approved',
        is_community: false,
      },
      {
        id: nanoid(),
        name: 'Full Print',
        category: 'apparel',
        description: 'All-over print design',
        color_variants: [],
        approval_status: 'approved',
        is_community: false,
      },
      {
        id: nanoid(),
        name: 'Pocket Print',
        category: 'apparel',
        description: 'Small design on chest pocket',
        color_variants: [],
        approval_status: 'approved',
        is_community: false,
      },
      {
        id: nanoid(),
        name: 'Back Print',
        category: 'apparel',
        description: 'Large design on back',
        color_variants: [],
        approval_status: 'approved',
        is_community: false,
      },

      // Accessories templates
      {
        id: nanoid(),
        name: 'Hat Logo',
        category: 'accessories',
        description: 'Front embroidery for caps',
        color_variants: [],
        approval_status: 'approved',
        is_community: false,
      },
      {
        id: nanoid(),
        name: 'Bag Design',
        category: 'accessories',
        description: 'Bag graphic print',
        color_variants: [],
        approval_status: 'approved',
        is_community: false,
      },

      // Home & living templates
      {
        id: nanoid(),
        name: 'Mug Front',
        category: 'home_living',
        description: 'Mug ceramic print',
        color_variants: [],
        approval_status: 'approved',
        is_community: false,
      },
      {
        id: nanoid(),
        name: 'Photo Pillow',
        category: 'home_living',
        description: 'Pillow front design',
        color_variants: [],
        approval_status: 'approved',
        is_community: false,
      },
      {
        id: nanoid(),
        name: 'Blanket Print',
        category: 'home_living',
        description: 'Full blanket design',
        color_variants: [],
        approval_status: 'approved',
        is_community: false,
      },
    ];

    let created = 0;
    for (const template of templates) {
      try {
        await Template.findOrCreate({
          where: { name: template.name, category: template.category },
          defaults: template,
        });
        created++;
        console.log(`✅ Created: ${template.name}`);
      } catch (error: any) {
        console.log(`⚠️  ${template.name}: ${error.message}`);
      }
    }

    console.log(`\n✨ Seeded ${created} templates total\n`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seedTemplates();
