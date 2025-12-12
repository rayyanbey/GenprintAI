/**
 * Setup script to create necessary directories for the application
 * Run this once after cloning the repository or when setting up for the first time
 */

import { mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

async function setup() {
  console.log('🚀 Setting up Genprint AI directories...\n');

  const directories = [
    'public/uploads',
    'public/uploads/avatars',
    'public/uploads/designs',
    'public/uploads/temp',
  ];

  for (const dir of directories) {
    const fullPath = join(process.cwd(), dir);
    
    if (existsSync(fullPath)) {
      console.log(`✅ Directory already exists: ${dir}`);
    } else {
      try {
        await mkdir(fullPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } catch (error) {
        console.error(`❌ Failed to create directory: ${dir}`, error);
      }
    }
  }

  console.log('\n✨ Setup complete! You can now run the application.');
  console.log('\nNext steps:');
  console.log('1. Make sure your .env file is configured');
  console.log('2. Run: npm run dev');
  console.log('3. Visit: http://localhost:3000\n');
}

setup().catch(console.error);
