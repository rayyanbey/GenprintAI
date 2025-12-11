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
    sequelizeInstance = global._sequelize ?? new Sequelize(process.env.DB_URL!, {
      dialect: "postgres",
      dialectModule: pg,
      logging: false,
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
  if (global._dbInitialized) return;
  
  try {
    const seq = getSequelize();
    await seq.authenticate();
    console.log("DB connection established.");

    await seq.sync({ alter: true });
    console.log("Tables created/updated successfully.");
    
    global._dbInitialized = true;
  } catch (err) {
    console.error("Unable to connect to DB:", err);
  }
}

// Initialize on first import in server environment
if (typeof window === 'undefined') {
  initializeDatabase();
}

