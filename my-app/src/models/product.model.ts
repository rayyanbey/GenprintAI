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
