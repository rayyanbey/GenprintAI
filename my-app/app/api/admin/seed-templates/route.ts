import { NextResponse } from 'next/server';
import { getModels } from '@/lib/db-dynamic';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const models = await getModels();
    const { Template } = models;

    const templates = [
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
    const results = [];

    for (const template of templates) {
      try {
        const [t, isNew] = await Template.findOrCreate({
          where: { name: template.name, category: template.category },
          defaults: template,
        });
        if (isNew) {
          created++;
        }
        results.push({ name: template.name, created: isNew });
      } catch (error: any) {
        results.push({ name: template.name, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${created} new templates`,
      created,
      results,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
