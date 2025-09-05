export interface Connection {
  id: string;
  name: string;
  type: "postgresql" | "mysql" | "mongodb";
  host: string;
  protocol?: string;
  search?: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  filepath?: string;
  ssl?: boolean;
  encryptedCredentials?: string;
}

export interface TableColumn {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  columnKey: string;
  defaultValue: string | null;
  extra: string;
}

export interface TableSchema {
  tableName: string;
  columns: TableColumn[];
}

export type postgresConfig = {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
};

export type mongoConfig = {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
};

export interface CrudResult {
  success: boolean;
  message?: string;
}

export type ColumnOptions = {
  name: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
  arrayDimension?: number;
  isNullable?: boolean;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  autoincrement?: boolean;
  default?: string;
  check?: string;
};

type Dialect = "postgresql" | "mysql" | "mongodb";
