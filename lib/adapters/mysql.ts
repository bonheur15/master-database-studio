
import { mysqlConfig } from "@/types";
import mysql from "mysql2/promise";

export const mysqlConnector = async (configs: mysqlConfig) => {
  const connection = await mysql.createConnection(configs);
  return connection;
};
