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
      order_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'confirmed',
      },
      total_amount: DataTypes.DECIMAL(10, 2),
      product_id: DataTypes.STRING,
      design_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Store product details at time of order
      product_name: DataTypes.STRING,
      product_price: DataTypes.DECIMAL(10, 2),
      product_image: DataTypes.TEXT,
      // Shipping information
      shipping_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
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
