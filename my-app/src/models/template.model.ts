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
      // Category for organization (apparel, accessories, phone_cases, keychains, mugs, etc.)
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Color variants for this template: [{name: "red", hex: "#FF0000"}, ...]
      color_variants: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      // Track template usage for trending/analytics
      usage_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      // Distinguish between Printful synced templates vs user community templates
      is_community: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      // For community templates: user who created it
      created_by_user_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Moderation status for community templates: pending, approved, rejected
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "approved", // Printful templates default to approved
      },
      // Link to Printful template if synced
      printful_template_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Additional metadata: version, tags, etc.
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
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
