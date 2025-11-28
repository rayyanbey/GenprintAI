import { DataTypes, Model, Sequelize } from "sequelize";

export default function TemplateModel(sequelize:Sequelize) {
  class Template extends Model {}

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
