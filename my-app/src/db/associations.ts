import { Model, ModelStatic } from "sequelize";

interface Models {
  [key: string]: ModelStatic<Model<any, any>>;
}

export function applyAssociations(models: Models) {
  const { User, Design, Template, Product, Mockup, Order, CommunityPost, PostLike} = models;

  User.hasMany(Design, { foreignKey: "user_id" });
  Design.belongsTo(User, { foreignKey: "user_id" });

  Template.hasMany(Design, { foreignKey: "template_id" });
  Design.belongsTo(Template, { foreignKey: "template_id" });

  Product.hasMany(Mockup, { foreignKey: "product_id" });
  Mockup.belongsTo(Product, { foreignKey: "product_id" });

  Design.hasMany(Mockup, { foreignKey: "design_id" });
  Mockup.belongsTo(Design, { foreignKey: "design_id" });

  User.hasMany(Order, { foreignKey: "user_id" });
  Order.belongsTo(User, { foreignKey: "user_id" });

  Product.hasMany(Order, { foreignKey: "product_id" });
  Order.belongsTo(Product, { foreignKey: "product_id" });

  Design.hasMany(Order, { foreignKey: "design_id" });
  Order.belongsTo(Design, { foreignKey: "design_id" });

  User.hasMany(CommunityPost, { foreignKey: "user_id" });
  CommunityPost.belongsTo(User, { foreignKey: "user_id" });

  Design.hasMany(CommunityPost, { foreignKey: "design_id" });
  CommunityPost.belongsTo(Design, { foreignKey: "design_id" });

  User.hasMany(PostLike, { foreignKey: "user_id" });
  PostLike.belongsTo(User, { foreignKey: "user_id" });

  CommunityPost.hasMany(PostLike, { foreignKey: "post_id" });
  PostLike.belongsTo(CommunityPost, { foreignKey: "post_id" });
}
