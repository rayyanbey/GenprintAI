import { DataTypes, Model, Sequelize } from "sequelize";

class Mockup extends Model {}

export default function MockupModel(sequelize:Sequelize) {
  

  Mockup.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      product_id: DataTypes.STRING,
      design_id: DataTypes.STRING,
      image_url: DataTypes.STRING,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Mockup",
      tableName: "mockups",
      timestamps: true,
    }
  );

  return Mockup;
}
