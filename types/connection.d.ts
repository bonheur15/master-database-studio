export interface Connection {
  id: string; // UUID
  name: string;
  type: "postgresql" | "mysql" | "sqlite" | "mongodb";
  host: string;
  protocol?: string; // Corrected from 'protocal'
  search?: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  filepath?: string; // For SQLite
  ssl?: boolean;
  encryptedCredentials?: string;
}

export interface TableColumn {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  columnKey: string; // e.g., 'PRI', 'UNI', 'MUL'
  defaultValue: string | null;
  extra: string; // e.g., 'auto_increment'
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

const initialDetails = {
  name: "",
  type: "mysql" as Connection["type"],
  protocol: undefined as Connection["protocol"],
  search: undefined as Connection["search"],
  host: "localhost",
  port: undefined as Connection["port"],
  user: "",
  password: "",
  database: "",
};
