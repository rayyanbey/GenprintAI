//sequlize db connection will be done here 
import { Sequelize } from "sequelize";

declare global {
  var _sequelize: Sequelize | undefined;
}

let sequelize: Sequelize;

if (!global._sequelize) {
  global._sequelize = new Sequelize(process.env.DB_URL!, {
    dialect: "postgres",
    logging: false,
  });
}

sequelize = global._sequelize!;

export default sequelize;