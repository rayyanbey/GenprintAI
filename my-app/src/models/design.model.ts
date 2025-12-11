import { DataTypes, Model, Sequelize } from "sequelize";

class Design extends Model {}

export default function DesignModel(sequelize:Sequelize) {
  

  Design.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      template_id: DataTypes.STRING,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Design",
      tableName: "designs",
      timestamps: true,
    }
  );

  return Design;
}
