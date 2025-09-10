# Master Database Studio

Master Database Studio is a modern, web based database management tool designed for developers. It provides a clean and intuitive interface to connect to, explore, and manage multiple databases, including PostgreSQL, MySQL, and MongoDB and more in future.

## Features

- **Multi Database Support:** Connect to and manage PostgreSQL, MySQL, and MongoDB databases.
- **Connection Management:** Easily save and manage multiple database connections.
- **Shareable Connections:** Share database connections securely via a unique token.
- **Data Viewer:** Browse and explore your database tables and collections with a clean, intuitive table view.
- **JSON Viewer:** View and explore JSON data within your database.
- **Query Editor:** Write and execute custom queries with syntax highlighting.
- **Light & Dark Mode:** Switch between light and dark themes for your comfort.
- **Responsive Design:** Access the studio from any device.

## Supported Databases

- PostgreSQL
- MySQL
- MongoDB
- More databases coming soon!

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and npm (or yarn/pnpm/bun) installed.

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/master-database-studio.git
    ```
2.  Install NPM packages
    ```sh
    bun install
    ```
3.  Start the development server
    ```sh
    bun run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Technologies Used

- **Framework:** [Next.js](https://nextjs.org/)
- **UI:** [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Database Drivers:** `pg`, `mysql2`, `mongodb`
- **Form Management:** [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Code Editor:** [React Simple Code Editor](https://github.com/satya164/react-simple-code-editor), [Prism.js](https://prismjs.com/)
- **SQL Formatter:** [sql-formatter](https://github.com/sql-formatter-org/sql-formatter)

## Project Structure

```
/
├── app/                # Next.js App Router pages and layouts
│   ├── actions/        # Server-side actions for database operations
│   ├── studio/         # Main application UI
│   └── ...
├── components/         # Shared UI components
│   ├── landing/        # Components for the landing page
│   └── ui/             # Reusable UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and libraries
│   ├── adapters/       # Database-specific adapters
│   └── ...
├── modules/            # Feature-based modules
│   ├── connection/     # Connection management UI
│   ├── data-viewer/    # Data viewing and exploration UI
│   └── master-console/ # Query editor UI
├── public/             # Static assets
└── ...
```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

\***\* to be added soon \*\***
