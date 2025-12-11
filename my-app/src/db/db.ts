import { Sequelize } from "sequelize";
import pg from "pg";

import UserModel from "../models/user.model";
import DesignModel from "../models/design.model";
import TemplateModel from "../models/template.model";
import ProductModel from "../models/product.model";
import MockupModel from "../models/mockup.model";
import OrderModel from "../models/order.model";
import CommunityPostModel from "../models/community_post.model";
import PostLikeModel from "../models/post_like.model";
import DesignEmbeddingModel from "../models/design_embedding.model";
import TrendModel from "../models/trends.model";
import CartItemModel from "../models/cart_item.model";
import { applyAssociations } from "./associations";

declare global {
  var _sequelize: Sequelize | undefined;
  var _models: any | undefined;
  var _dbInitialized: boolean | undefined;
}

let sequelizeInstance: Sequelize | null = null;
let modelsCache: any = null;


function getSequelize() {
  if (!sequelizeInstance) {
    const dbUrl = process.env.DB_URL || process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error("Database URL not found. Please set DB_URL or DATABASE_URL environment variable.");
    }
    
    console.log("Creating Sequelize instance with database URL...");
    
    sequelizeInstance = global._sequelize ?? new Sequelize(dbUrl, {
      dialect: "postgres",
      dialectModule: pg,
      logging: (msg) => console.log("🔵 SQL:", msg), // Enable SQL logging
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });
    
    if (!global._sequelize) {
      global._sequelize = sequelizeInstance;
    }
  }
  return sequelizeInstance;
}


function getModels() {
  if (!modelsCache) {
    const seq = getSequelize();
    modelsCache = global._models ?? {
      User: UserModel(seq),
      Design: DesignModel(seq),
      Template: TemplateModel(seq),
      Product: ProductModel(seq),
      Mockup: MockupModel(seq),
      Order: OrderModel(seq),
      CommunityPost: CommunityPostModel(seq),
      PostLike: PostLikeModel(seq),
      DesignEmbedding: DesignEmbeddingModel(seq),
      Trend: TrendModel(seq),
      CartItem: CartItemModel(seq),
    };
    
    if (!global._models) {
      global._models = modelsCache;
      // Apply associations once
      applyAssociations(modelsCache);
    }
  }
  return modelsCache;
}

export const sequelize = getSequelize();
export const models = getModels();

// Initialize database connection lazily
async function initializeDatabase() {
  if (global._dbInitialized) {
    console.log("Database already initialized.");
    return;
  }
  
  console.log("Initializing database connection...");
  
  try {
    const seq = getSequelize();
    await seq.authenticate();
    console.log("✅ DB connection established successfully.");

    // Sync models with database
    await seq.sync({ alter: true });
    console.log("✅ Tables created/updated successfully.");
    
    // List all models
    const modelNames = Object.keys(getModels());
    console.log(`📊 Registered models: ${modelNames.join(', ')}`);
    
    global._dbInitialized = true;
  } catch (err) {
    console.error("❌ Unable to connect to DB:", err);
    throw err;
  }
}

// Initialize on first import in server environment
if (typeof window === 'undefined') {
  initializeDatabase().catch(err => {
    console.error("Database initialization failed:", err);
  });
}

export { initializeDatabase };

