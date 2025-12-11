import { DataTypes, Model, Sequelize } from "sequelize";

class Template extends Model {}

export default function TemplateModel(sequelize:Sequelize) {
  

  Template.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Template",
      tableName: "templates",
      timestamps: true,
    }
  );

  return Template;
}
