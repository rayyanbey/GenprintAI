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
      variant_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Async task tracking
      task_key: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      // Status: pending, completed, failed
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed"),
        defaultValue: "pending",
      },
      // Placement on product: front, back, side, sleeve, neck, etc.
      placement: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "front",
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // When the image URL expires (72 hours from generation)
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Printfile URL for order fulfillment
      printfile_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Layer/viewing angle: front, back, side, sleeve, neck, etc. (DEPRECATED use placement)
      layer_position: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "front",
      },
      // Image resolution/size: thumbnail, medium, high_res
      display_size: {
        type: DataTypes.ENUM("thumbnail", "medium", "high_res"),
        defaultValue: "medium",
      },
      // Printful file ID for regeneration
      printful_file_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Additional metadata: rotation_url (for 360 video), background color, etc.
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
      modelName: "Mockup",
      tableName: "mockups",
      timestamps: true,
    }
  );

  return Mockup;
}
