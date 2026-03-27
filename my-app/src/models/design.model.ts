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
      approval_status: {
        type: DataTypes.STRING(50),
        defaultValue: 'approved',
      },
      is_community: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      admin_feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Feedback from admin about the design',
      },
      admin_feedback_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When feedback was provided',
      },
      admin_feedback_from_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'User ID of admin who provided feedback',
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
