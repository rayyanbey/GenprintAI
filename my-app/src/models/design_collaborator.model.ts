import { DataTypes, Model, Sequelize } from "sequelize";

class DesignCollaborator extends Model {}

export default function DesignCollaboratorModel(sequelize: Sequelize) {
  DesignCollaborator.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      design_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      invited_by: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "viewer",
        validate: {
          isIn: [["viewer", "editor"]],
        },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "DesignCollaborator",
      tableName: "design_collaborators",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["design_id", "user_id"],
        },
      ],
    }
  );

  return DesignCollaborator;
}
