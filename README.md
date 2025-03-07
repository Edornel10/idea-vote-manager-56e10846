
# Idea Vote Manager

This project is a web application for submitting, voting on, and managing ideas. It uses React for the frontend and MariaDB for the database.

## Project info

**URL**: https://lovable.dev/projects/cd64373b-c94d-4372-a6fd-498f77b7fb1e

## How to run with Docker

This project can be run using Docker, which provides an easy setup with both the web application and the MariaDB database.

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Run the application with Docker Compose
docker-compose up -d
```

The application will be available at http://localhost:8080

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/cd64373b-c94d-4372-a6fd-498f77b7fb1e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- MariaDB
- Docker

## Database Schema

The application uses the following database schema:

### Ideas Table
- `id` - VARCHAR(36) - Primary Key
- `title` - VARCHAR(255) - Not Null
- `category` - VARCHAR(100) - Not Null
- `description` - TEXT - Not Null
- `summary` - TEXT
- `votes` - INT - Default 0
- `created_at` - TIMESTAMP - Default Current Timestamp
- `frozen` - BOOLEAN - Default False

### Users Table
- `id` - VARCHAR(36) - Primary Key
- `username` - VARCHAR(100) - Unique, Not Null
- `password_hash` - VARCHAR(255) - Not Null
- `role` - ENUM('admin', 'standard') - Default 'standard'

## Default Login

The application comes with a default admin user:
- Username: admin
- Password: admin123

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/cd64373b-c94d-4372-a6fd-498f77b7fb1e) and click on Share -> Publish.

For deployment with Docker, you can use any Docker-compatible hosting service.
