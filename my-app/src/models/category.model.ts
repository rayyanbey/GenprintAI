import { DataTypes, Model, Sequelize } from "sequelize";

class Category extends Model {}

export default function CategoryModel(sequelize: Sequelize) {
  
  Category.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      catalog_position: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      size: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Hierchical path for faster queries (e.g., "0/1/6/24")
      path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Level in hierarchy (0 for root, 1 for children, etc.)
      level: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
      timestamps: true,
    }
  );

  return Category;
}
