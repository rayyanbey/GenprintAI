import { DataTypes, Model, Sequelize } from "sequelize";

class CommunityComment extends Model {}

export default function CommunityCommentModel(sequelize: Sequelize) {
  CommunityComment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "CommunityComment",
      tableName: "community_comments",
      timestamps: false,
    }
  );

  return CommunityComment;
}
