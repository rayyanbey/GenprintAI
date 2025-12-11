import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/src/db/db';
import { getModels } from '@/lib/db-dynamic';

// GET /api/db/init - Manually trigger database initialization
export async function GET() {
  try {
    console.log("Manual database initialization triggered...");
    
    await initializeDatabase();
    
    const models = await getModels();
    const modelNames = Object.keys(models);
    
    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      models: modelNames,
      count: modelNames.length,
    });
  } catch (error: any) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
