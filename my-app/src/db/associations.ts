import { Model, ModelStatic } from "sequelize";

interface Models {
  [key: string]: ModelStatic<Model<any, any>>;
}

export function applyAssociations(models: Models) {
  const { User, Design, Template, Product, Mockup, Order, CommunityPost, PostLike, DesignEmbedding, CartItem, ProductVariant, TemplateUsage } = models;

  // User associations
  User.hasMany(Design, { foreignKey: "user_id" });
  Design.belongsTo(User, { foreignKey: "user_id" });

  // Template associations
  Template.hasMany(Design, { foreignKey: "template_id" });
  Design.belongsTo(Template, { foreignKey: "template_id" });

  // Template created by user (for community templates)
  User.hasMany(Template, { foreignKey: "created_by_user_id", as: "createdTemplates" });
  Template.belongsTo(User, { foreignKey: "created_by_user_id", as: "creator" });

  // Template usage tracking
  Template.hasMany(TemplateUsage, { foreignKey: "template_id" });
  TemplateUsage.belongsTo(Template, { foreignKey: "template_id" });

  User.hasMany(TemplateUsage, { foreignKey: "user_id" });
  TemplateUsage.belongsTo(User, { foreignKey: "user_id" });

  // Mockup associations
  Product.hasMany(Mockup, { foreignKey: "product_id" });
  Mockup.belongsTo(Product, { foreignKey: "product_id" });

  Design.hasMany(Mockup, { foreignKey: "design_id" });
  Mockup.belongsTo(Design, { foreignKey: "design_id" });

  // Product variant associations
  Product.hasMany(ProductVariant, { foreignKey: "product_id" });
  ProductVariant.belongsTo(Product, { foreignKey: "product_id" });

  // Order associations
  User.hasMany(Order, { foreignKey: "user_id" });
  Order.belongsTo(User, { foreignKey: "user_id" });

  Product.hasMany(Order, { foreignKey: "product_id" });
  Order.belongsTo(Product, { foreignKey: "product_id" });

  Design.hasMany(Order, { foreignKey: "design_id" });
  Order.belongsTo(Design, { foreignKey: "design_id" });

  // Community associations
  User.hasMany(CommunityPost, { foreignKey: "user_id" });
  CommunityPost.belongsTo(User, { foreignKey: "user_id" });

  Design.hasMany(CommunityPost, { foreignKey: "design_id" });
  CommunityPost.belongsTo(Design, { foreignKey: "design_id" });

  User.hasMany(PostLike, { foreignKey: "user_id" });
  PostLike.belongsTo(User, { foreignKey: "user_id" });

  CommunityPost.hasMany(PostLike, { foreignKey: "post_id" });
  PostLike.belongsTo(CommunityPost, { foreignKey: "post_id" });

  // Design embedding associations
  Design.hasMany(DesignEmbedding, { foreignKey: "design_id" });
  DesignEmbedding.belongsTo(Design, { foreignKey: "design_id" });

  // CartItem associations
  User.hasMany(CartItem, { foreignKey: "user_id" });
  CartItem.belongsTo(User, { foreignKey: "user_id" });

  Product.hasMany(CartItem, { foreignKey: "product_id" });
  CartItem.belongsTo(Product, { foreignKey: "product_id" });

  Design.hasMany(CartItem, { foreignKey: "design_id" });
  CartItem.belongsTo(Design, { foreignKey: "design_id" });
}
