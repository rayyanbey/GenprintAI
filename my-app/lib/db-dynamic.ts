// Dynamic import wrapper to prevent edge runtime issues
export async function getModels() {
  const { models } = await import("@/src/db/db");
  return models;
}

export async function getSequelize() {
  const { sequelize } = await import("@/src/db/db");
  return sequelize;
}
