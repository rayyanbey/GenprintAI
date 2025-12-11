import { DataTypes, Model, Sequelize } from "sequelize";

class Product extends Model {}

export default function ProductModel(sequelize:Sequelize) {
  
  Product.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      category: DataTypes.STRING,
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Printful specific fields
      printful_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      model: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      variant_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_discontinued: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      origin_country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Store additional data as JSON
      techniques: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      files: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      timestamps: true,
    }
  );

  return Product;
}
