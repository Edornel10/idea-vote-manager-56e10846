# Idea Manager
This project was made using the Lovable AI tool and GitHub to co-develop. It is currently still based on Supabase as a backend to store information.

!!! Use the Release Branch !!! In the main branch I tried to implement docker and the MariaDB works but the Website is broken. Its probably best to set it up anew.



## Continue Development
```sh
# Step 1: Clone the repository using the project's Git URL and using the Release Branch.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Next Steps
- Update to a local Database with the following Table structure which currently stores users and ideas but is hosted anywhere.
![supabase-schema-bipiwqdnwnuxgwfpyarh](https://github.com/user-attachments/assets/57165375-3d49-402d-a26c-4dcd26f40055)

- Use Docker to deploy the project more easily.
  - We need three containers. Database, Website listener, Nginx/Apache to serve  

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


