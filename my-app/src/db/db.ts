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

  var _models: any;
  var _dbInitialized: boolean | undefined;
}

// 1. Create or reuse sequelize
export const sequelize =
  global._sequelize ??
  (global._sequelize = new Sequelize(process.env.DB_URL!, {
    dialect: "postgres",
    dialectModule: pg,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }));

// 2. Create or reuse models
export const models =
  global._models ??
  (global._models = {
    User: UserModel(sequelize),
    Design: DesignModel(sequelize),
    Template: TemplateModel(sequelize),
    Product: ProductModel(sequelize),
    Mockup: MockupModel(sequelize),
    Order: OrderModel(sequelize),
    CommunityPost: CommunityPostModel(sequelize),
    PostLike: PostLikeModel(sequelize),
    DesignEmbedding: DesignEmbeddingModel(sequelize),
    Trend:TrendModel(sequelize),
  });

// 3. Apply associations ONLY once
if (!global._dbInitialized) {
  applyAssociations(models);
  global._dbInitialized = true;
}

// 4. DO NOT auto sync in Next.js
// if (process.env.NODE_ENV !== "production") {
//   sequelize.authenticate().then(() => {
//     console.log("✅ DB connected");
//   });
// }

(async () => {

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
        ssl: { rejectUnauthorized: false },
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
    const sequelize = getSequelize();
    modelsCache = global._models ?? {
      User: UserModel(sequelize),
      Design: DesignModel(sequelize),
      Template: TemplateModel(sequelize),
      Product: ProductModel(sequelize),
      Mockup: MockupModel(sequelize),
      Order: OrderModel(sequelize),
      CommunityPost: CommunityPostModel(sequelize),
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
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log("DB connection established.");

    await sequelize.sync({ alter: true });
    console.log("Tables created/updated successfully.");
    
    global._dbInitialized = true;
  } catch (err) {
    console.error("Unable to connect to DB:", err);
  }

})();

}

// Initialize on first import in server environment
if (typeof window === 'undefined') {
  initializeDatabase();
}

