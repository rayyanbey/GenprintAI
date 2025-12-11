import { DataTypes, Model, Sequelize } from "sequelize";

class CartItem extends Model {}

export default function CartItemModel(sequelize: Sequelize) {
  CartItem.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      design_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      variant: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "CartItem",
      tableName: "cart_items",
      timestamps: true,
    }
  );

  return CartItem;
}
