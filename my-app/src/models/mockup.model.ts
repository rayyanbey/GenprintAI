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
      // Layer/viewing angle: front, back, side, sleeve, neck, etc.
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
