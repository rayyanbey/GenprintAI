import { DataTypes, Model, Sequelize } from "sequelize";

export default function TemplateUsageModel(sequelize: Sequelize) {
  class TemplateUsage extends Model {}

  TemplateUsage.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      template_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // If this template was used to create a design, reference that design
      used_in_design_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // When user saved/used this template
      saved_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "TemplateUsage",
      tableName: "template_usages",
      timestamps: true,
    }
  );

  return TemplateUsage;
}
