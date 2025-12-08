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
