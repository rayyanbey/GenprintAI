import { DataTypes, Model, Sequelize } from "sequelize";

class CommunityPost extends Model {}

export default function CommunityPostModel(sequelize:Sequelize) {
  
  CommunityPost.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true,
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
