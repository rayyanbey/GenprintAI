import { DataTypes, Model, Sequelize } from "sequelize";

class PostLike extends Model {}

export default function PostLikeModel(sequelize: Sequelize) {


  PostLike.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "PostLike",
      tableName: "post_likes",
      timestamps: true,
    }
  );

  return PostLike;
}
