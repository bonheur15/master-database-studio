export interface Connection {
  id: string; // UUID
  name: string;
  type: 'postgres' | 'mysql' | 'sqlite' | 'mongodb'; // Example types
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  filepath?: string; // For SQLite
  encryptedCredentials?: string; // To store encrypted sensitive data
}
