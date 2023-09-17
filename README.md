# Cici Panel

An admin panel for turning your software into a SaaS.

- [Cici Panel](#cici-panel)
  - [Features](#features)
  - [Tech-stack](#tech-stack)
  - [Developing](#developing)
  - [Building](#building)
  - [About](#about)

## Features

- [ ] i18n support
- [ ] dark/light theme
- [ ] users
  - [ ] teams
  - [ ] granular permissions
- [ ] customers
  - [ ] projects
    - [ ] api keys
- [ ] stripe connection
- [ ] payment checking adapters
- [ ] email verification
- [ ] password reset
- [ ] remote warnings
- [ ] multi-language adapters/integration
- [ ] enable/disable features using .env
- [ ] issue tracking
  - [ ] per company
  - [ ] per project
  - [ ] per user
  - [ ] assigned users per issue
  - [ ] importance tags
  - [ ] tags
- [ ] enable/disable new sign-ups
- [ ] email & password login

## Tech-stack

- SvelteKit (Typescript)
- Skeleton UI
- PostgreSQL
- Drizzle ORM
- Lucia Auth

## Developing

1. Clone the project:

    ```bash
    git clone https://github.com/recoskyler/cici-panel.git

    # CD into the repository folder
    cd cici-panel
    ```

2. Create an .env file:

    ```bash
    cp sample.env .env
    ```

3. Fill in the required fields in the .env file using your favorite editor:

    ```bash
    vim .env
    ```

4. Generate the database migrations:

    ```bash
    npm run generate
    ```

5. Run the development server:

    ```bash
    npm run dev

    # or start the server and open the app in a new browser tab
    npm run dev -- --open
    ```

## Building

To create a production version of your app:

1. Create an .env file:

    ```bash
    cp sample.env .env
    ```

2. Fill in the required fields in the .env file using your favorite editor:

    ```bash
    vim .env
    ```

3. Run the tests and fix any issues:

    ```bash
    npm run test
    ```

4. Check for issues within the code, and fix if any appears:

    ```bash
    npm run check
    ```

5. Lint the code and fix any issues:

    ```bash
    npm run fix-lint
    ```

6. Generate the database migrations:

    ```bash
    npm run generate
    ```

7. Create a production version of the app:

    ```bash
    npm run build
    ```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## About

By [recoskyler](https://github.com/recoskyler) - September 2023
