import { Sequelize } from "sequelize";
import pg from "pg";

import UserModel from "../models/user.model";
import DesignModel from "../models/design.model";
import TemplateModel from "../models/template.model";
import ProductModel from "../models/product.model";
import MockupModel from "../models/mockup.model";
import OrderModel from "../models/order.model";
import CommunityPostModel from "../models/community_post.model";
import { applyAssociations } from "./associations";

declare global {
  var _sequelize: Sequelize | undefined;
}

export const sequelize: Sequelize =
  global._sequelize ??
  (global._sequelize = new Sequelize(process.env.DB_URL!, {
    dialect: "postgres",
    dialectModule: pg,
    logging: false,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }));

// Initialize all models
export const models = {
  User: UserModel(sequelize),
  Design: DesignModel(sequelize),
  Template: TemplateModel(sequelize),
  Product: ProductModel(sequelize),
  Mockup: MockupModel(sequelize),
  Order: OrderModel(sequelize),
  CommunityPost: CommunityPostModel(sequelize),
};

// Apply associations
applyAssociations(models);

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
