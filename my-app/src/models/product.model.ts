import { DataTypes, Model, Sequelize } from "sequelize";

export default function ProductModel(sequelize:Sequelize) {
  class Product extends Model {}

  Product.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
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
