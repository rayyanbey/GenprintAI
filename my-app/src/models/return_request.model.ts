import { DataTypes, Model, Sequelize } from "sequelize";

class ReturnRequest extends Model {}

export default function ReturnRequestModel(sequelize: Sequelize) {
  ReturnRequest.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reason_details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      requested_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        allowNull: false,
        // Status flow: pending → approved → refunded OR rejected
      },
      // Admin review
      admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approved_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Refund details
      refund_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      refund_status: {
        type: DataTypes.STRING,
        allowNull: true,
        // Status: pending_approval, processing, processed, failed
      },
      stripe_refund_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      refunded_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ReturnRequest",
      tableName: "return_requests",
      timestamps: true,
    }
  );

  return ReturnRequest;
}
