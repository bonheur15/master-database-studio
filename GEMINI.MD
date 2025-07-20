# **Master Database Studio**

A modern browser-based database management studio, built with Next.js, that helps developers and data analysts connect, query, and manage databases effortlessly - all with local encrypted credentials, no server-side storage, and a sleek open-source UI.


## **Vision**

Master Database Studio aims to make database management:

- **Universal:** Connect to multiple databases from one tool.

- **Simple:** Minimal setup, intuitive UX.

- **Secure:** Credentials are stored locally and encrypted.

- **Flexible:** Self-hostable with zero vendor lock-in.

- **Powerful:** Full CRUD and SQL/Query execution.

- **Open-source:** Community-driven and extensible.


## **Key Features**

### **Connection System**

- LocalStorage-Based Encrypted Credential Storage.

- Auto-Detect from Connection String (e.g., MySQL URI, PostgreSQL URI, MongoDB URI).

- Manual connect: choose database type, fill host/user/pass/db.

- Saved connections in a local vault (can be cleared or exported).


### **Database Support**

**Out of the box:**

- MySQL

- PostgreSQL

- MongoDB

**Future support planned:**

- SQLite

- MariaDB

- Redis

- Firebase

- Supabase

- Cassandra


### **Data Explorer (Master Data Viewer)**

- Browse all tables/collections.

- View records with pagination.

- Search/filter records.

- Expand nested JSON fields (for Mongo).

- Inline edit/delete/add rows.

- Foreign key navigation (where available).


### **Query Console (Master Console)**

- SQL Editor for MySQL & PostgreSQL.

- Mongo Query (with JSON syntax support).

- Real-time syntax highlighting.

- Query history (locally stored).

- Export query result (CSV, JSON).


## **Technical Stack**

|   |
| - |

|            |                                                          |
| ---------- | -------------------------------------------------------- |
| **Area**   | **Tech**                                                 |
| Frontend   | Next.js (App Router), TailwindCSS, TypeScript, Shadcn/ui |
| Database   | Native database driver for each DB                       |
| Encryption | AES (in-browser crypto)                                  |
| Storage    | IndexedDB / LocalStorage                                 |
| Deployment | Vercel                                                   |


## **Modular Architecture**

1. **Connection Module (/modules/connection)**: Handles creating, storing (encrypted), and managing database connections.

2. **Database Adapters (/lib/adapters)**: Provides a consistent interface for interacting with different database types (MySQL, PostgreSQL, MongoDB).
/lib/adapters
- mysqlAdapter.ts
- postgresAdapter.ts
- mongoAdapter.ts


3. **Master Data Viewer (/modules/data-viewer)**: UI for browsing, viewing, and interacting with data in tables/collections.
/modules/data-viewer
- ExplorerSidebar.tsx
- TableViewer.tsx
- RowEditor.tsx


4. **Master Console (/modules/query-console)**: UI for manually running SQL or MongoDB queries.
/modules/query-console
- QueryEditor.tsx
- QueryHistory.tsx
- ResultViewer.tsx


5. **UI Framework (/components)**: Core UI components, layout, and theme management.


## **Security Architecture**

- All credentials are encrypted with AES and stored in the local browser (IndexedDB or LocalStorage).

- An optional passphrase can be required to unlock the stored credentials.

- No credentials or data are sent to external servers.

- Next.js server actions connect to the database at runtime but do not persist credentials on the server.


## **Feature Development Checklist**

|                             |              |                     |
| --------------------------- | ------------ | ------------------- |
| **Feature**                 | **Priority** | **Component(s)**    |
| Manual Connect Form         | Required     | ConnectForm.tsx     |
| Auto Detect from URI        | Required     | AutoDetect.tsx      |
| Local Credential Vault      | Required     | Vault.ts            |
| Encryption Utils (AES)      | Required     | encryption.ts       |
| DB Table/Collection List    | Required     | ExplorerSidebar.tsx |
| Record Viewer w/ Pagination | Required     | TableViewer.tsx     |
| Inline Edit/Add/Delete Rows | Required     | RowEditor.tsx       |
| Query Console (SQL/JSON)    | Required     | QueryEditor.tsx     |
| Query History               | Required     | QueryHistory.tsx    |
| Foreign Key Navigation      | Required     | TableViewer.tsx     |
| Theme Toggle                | Required     | ThemeSwitcher.tsx   |
| Tabbed Query Interface      | Nice-to-Have | Tabs.tsx            |

*** USE SERVER ACTIONS FOR DATABASE CONNECTIONS ***
*** USE LOCALSTORAGE FOR CREDENTIALS STORAGE ***
*** USE AES ENCRYPTION FOR CREDENTIALS ***
*** Dont use api routes for database connections, use server actions even for other backend related ***
*** will make homepage later but for now it will be at /studio everything will be in /studio ****
*** The homepage will be a simple landing page with links to the studio and documentation ***
*** dONT RUN BUILD OR START COMMANDS OR LINT, JUST MAKE SURE THE CODE YOU WRITE IS CORRECT AND WORKS ***