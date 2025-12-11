import { DataTypes, Model, Sequelize } from "sequelize";

class DesignEmbedding extends Model {}

export default function DesignEmbeddingModel(sequelize: Sequelize) {
  
  DesignEmbedding.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      design_id: { type: DataTypes.STRING, allowNull: false },
      prompt: { type: DataTypes.TEXT, allowNull: false },
      embedding: { type: DataTypes.ARRAY(DataTypes.FLOAT), allowNull: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: "DesignEmbedding",
      tableName: "design_embeddings",
      timestamps: false,
    }
  );

  return DesignEmbedding;
}
