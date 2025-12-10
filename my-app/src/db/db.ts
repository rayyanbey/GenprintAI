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
  try {
    await sequelize.authenticate();
    console.log("DB connection established.");

    await sequelize.sync({ alter: true }); // sync models with DB
    console.log("Tables created/updated successfully.");
  } catch (err) {
    console.error("Unable to connect to DB:", err);
  }
})();