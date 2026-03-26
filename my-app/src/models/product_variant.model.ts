import { DataTypes, Model, Sequelize } from "sequelize";

export default function ProductVariantModel(sequelize: Sequelize) {
  class ProductVariant extends Model {}

  ProductVariant.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Printful's unique variant ID
      printful_variant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // Variant name/description
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Size: S, M, L, XL, etc.
      size: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Color name
      color: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Base price from Printful
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      // Is this variant available
      availability: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      // SKU from Printful
      sku: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Weight in ounces/grams
      weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      // Additional variant data as JSON
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      // Inventory management fields
      low_stock_threshold: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        allowNull: true,
      },
      stock_level: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "ProductVariant",
      tableName: "product_variants",
      timestamps: true,
    }
  );

  return ProductVariant;
}
