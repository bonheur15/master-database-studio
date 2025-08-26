import { Connection } from "@/types/connection";
import mysql from "mysql2/promise";

export const mysqlConnector = async (connection: Connection) => {
  const mysqlUri = `mysql://${connection.user}:${connection.password}@${
    connection.host
  }${connection.port ? `:${connection.port}` : ""}${
    connection.database ? `/${connection.database}` : ""
  }${
    connection.search
      ? connection.search.startsWith("?")
        ? connection.search
        : `?${connection.search}`
      : ""
  }`;

  const client = await mysql.createConnection(mysqlUri);
  return client;
};
