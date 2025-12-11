import UserModel from "@/src/models/user.model";
import DesignModel from "@/src/models/design.model";
import TemplateModel from "@/src/models/template.model";
import ProductModel from "@/src/models/product.model";
import MockupModel from "@/src/models/mockup.model";
import OrderModel from "@/src/models/order.model";
import CommunityPostModel from "@/src/models/community_post.model";
import CartItemModel from "@/src/models/cart_item.model";


import { applyAssociations } from "@/src/db/associations";
import { Sequelize } from "sequelize";

export function initModels(sequelize:Sequelize) {
  const models = {
    User: UserModel(sequelize),
    Design: DesignModel(sequelize),
    Template: TemplateModel(sequelize),
    Product: ProductModel(sequelize),
    Mockup: MockupModel(sequelize),
    Order: OrderModel(sequelize),
    CommunityPost: CommunityPostModel(sequelize),
    CartItem: CartItemModel(sequelize),
  };


  applyAssociations(models);

  return models;
}
