import { DataTypes, Model, Sequelize } from "sequelize";

export default function CommunityPostModel(sequelize:Sequelize) {
  class CommunityPost extends Model {}

  CommunityPost.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      user_id: DataTypes.STRING,
      design_id: DataTypes.STRING,
      title: DataTypes.STRING,
      content: DataTypes.STRING,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "CommunityPost",
      tableName: "community_posts",
      timestamps: false,
    }
  );

  return CommunityPost;
}
