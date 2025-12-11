import { DataTypes, Model, Sequelize } from "sequelize";

class Trend extends Model {}

export default function TrendModel(sequelize: Sequelize) {
  Trend.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      source: {
        type: DataTypes.STRING,   // 'reddit' | 'twitter'
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      url: {
        type: DataTypes.TEXT,
      },

      category: {
        type: DataTypes.STRING,   // 'template' | 'community'
      },

      score: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },

      metadata: {
        type: DataTypes.JSONB,
      },

      last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Trend",
      tableName: "trends",
      timestamps: false,
    }
  );

  return Trend;
}
