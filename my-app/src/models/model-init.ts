import UserModel from "@/src/models/user.model";
import DesignModel from "@/src/models/design.model";
import TemplateModel from "@/src/models/template.model";
import ProductModel from "@/src/models/product.model";
import MockupModel from "@/src/models/mockup.model";
import OrderModel from "@/src/models/order.model";
import CommunityPostModel from "@/src/models/community_post.model";
import PostLikeModel from "@/src/models/post_like.model";
import DesignEmbeddingModel from "@/src/models/design_embedding.model";
import TrendModel from "@/src/models/trends.model";
import CartItemModel from "@/src/models/cart_item.model";
import ProductVariantModel from "@/src/models/product_variant.model";
import TemplateUsageModel from "@/src/models/template_usage.model";
import CategoryModel from "@/src/models/category.model";
import CommunityCommentModel from "@/src/models/community_comment.model";
import CommunityRatingModel from "@/src/models/community_rating.model";
import DesignCollaboratorModel from "@/src/models/design_collaborator.model";
import ReturnRequestModel from "@/src/models/return_request.model";

import { applyAssociations } from "@/src/db/associations";
import { Sequelize } from "sequelize";

export function initModels(sequelize: Sequelize) {
  const models = {
    User: UserModel(sequelize),
    Design: DesignModel(sequelize),
    Template: TemplateModel(sequelize),
    Product: ProductModel(sequelize),
    Mockup: MockupModel(sequelize),
    Order: OrderModel(sequelize),
    CommunityPost: CommunityPostModel(sequelize),
    PostLike: PostLikeModel(sequelize),
    DesignEmbedding: DesignEmbeddingModel(sequelize),
    Trend: TrendModel(sequelize),
    CartItem: CartItemModel(sequelize),
    ProductVariant: ProductVariantModel(sequelize),
    TemplateUsage: TemplateUsageModel(sequelize),
    Category: CategoryModel(sequelize),
    CommunityComment: CommunityCommentModel(sequelize),
    CommunityRating: CommunityRatingModel(sequelize),
    DesignCollaborator: DesignCollaboratorModel(sequelize),
    ReturnRequest: ReturnRequestModel(sequelize),
  };

  applyAssociations(models);

  return models;
}
