import { DataTypes, Model, Sequelize } from "sequelize";

class Order extends Model {}

export default function OrderModel(sequelize:Sequelize) {
  

  Order.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      user_id: DataTypes.STRING,
      order_date: DataTypes.DATE,
      status: DataTypes.STRING,
      total_amount: DataTypes.DECIMAL,
      product_id: DataTypes.STRING,
      design_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
      timestamps: true,
    }
  );

  return Order;
}
