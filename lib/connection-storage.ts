import { Connection } from '../types/connection';
import { encrypt, decrypt } from './crypto';
import { v4 as uuidv4 } from 'uuid';

const CONNECTIONS_STORAGE_KEY = 'master_database_studio_connections';

export async function saveConnections(connections: Connection[]): Promise<void> {
  const encryptedConnections = await Promise.all(
    connections.map(async (conn) => {
      const sensitiveData = JSON.stringify({
        password: conn.password,
        filepath: conn.filepath,
      });
      const encryptedSensitiveData = await encrypt(sensitiveData);
      return { ...conn, encryptedCredentials: encryptedSensitiveData, password: '' }; // Clear password after encryption
    })
  );
  localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(encryptedConnections));
}

export async function loadConnections(): Promise<Connection[]> {
  const storedConnections = localStorage.getItem(CONNECTIONS_STORAGE_KEY);
  if (!storedConnections) {
    return [];
  }

  const parsedConnections: Connection[] = JSON.parse(storedConnections);

  const decryptedConnections = await Promise.all(
    parsedConnections.map(async (conn) => {
      if (conn.encryptedCredentials) {
        try {
          const decryptedSensitiveData = await decrypt(conn.encryptedCredentials);
          const sensitiveData = JSON.parse(decryptedSensitiveData);
          return { ...conn, password: sensitiveData.password, filepath: sensitiveData.filepath };
        } catch (error) {
          console.error('Error decrypting connection credentials:', error);
          // Handle decryption errors, e.g., by returning the connection without sensitive data
          return { ...conn, password: '', filepath: '' };
        }
      }
      return conn;
    })
  );

  return decryptedConnections;
}

export async function addConnection(newConnection: Omit<Connection, 'id'>): Promise<Connection[]> {
  const connections = await loadConnections();
  const connectionWithId = { ...newConnection, id: uuidv4() };
  const updatedConnections = [...connections, connectionWithId];
  await saveConnections(updatedConnections);
  return updatedConnections;
}

export async function deleteConnection(id: string): Promise<Connection[]> {
  const connections = await loadConnections();
  const updatedConnections = connections.filter(conn => conn.id !== id);
  await saveConnections(updatedConnections);
  return updatedConnections;
}

export async function updateConnection(updatedConnection: Connection): Promise<Connection[]> {
  const connections = await loadConnections();
  const index = connections.findIndex(conn => conn.id === updatedConnection.id);
  if (index > -1) {
    connections[index] = updatedConnection;
    await saveConnections(connections);
  }
  return connections;
}
