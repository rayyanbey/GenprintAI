import { DataTypes, Model, Sequelize } from "sequelize";

class CommunityRating extends Model {}

export default function CommunityRatingModel(sequelize: Sequelize) {
  CommunityRating.init(
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
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "CommunityRating",
      tableName: "community_ratings",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["post_id", "user_id"],
        },
      ],
    }
  );

  return CommunityRating;
}
