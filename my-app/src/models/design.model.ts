import { DataTypes, Model, Sequelize } from "sequelize";

class Design extends Model {}

export default function DesignModel(sequelize:Sequelize) {
  

  Design.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      template_id: DataTypes.STRING,
      canvas_data: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Stores the canvas state as JSON',
      },
      artwork_file_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URL to the exported artwork file for Printful',
      },
      export_format: {
        type: DataTypes.STRING,
        defaultValue: 'png',
        allowNull: true,
      },
      version_number: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      parent_design_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Reference to parent design for versioning',
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      is_archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Design",
      tableName: "designs",
      timestamps: true,
    }
  );

  return Design;
}
