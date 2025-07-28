export interface Connection {
  id: string; // UUID
  name: string;
  type: "postgresql" | "mysql" | "sqlite" | "mongodb"; // Example types
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  filepath?: string; // For SQLite
  encryptedCredentials?: string; // To store encrypted sensitive data
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
