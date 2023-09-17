# Cici Panel

An admin panel template with granular permissions, roles, email verification, password resets, user groups and management.

- [Cici Panel](#cici-panel)
  - [Features](#features)
  - [Tech-stack](#tech-stack)
  - [Developing](#developing)
  - [Building](#building)
  - [LICENSE](#license)
  - [About](#about)

## Features

- [ ] I18N support
- [ ] Dark/light theme
- [ ] Teams
- [ ] Granular permissions
- [ ] Roles
- [ ] User groups
- [ ] Email verification
- [ ] Password reset
- [ ] Enable/disable features using .env
  - [ ] Granular permissions
  - [ ] Password resets
  - [ ] Sign-ups
  - [ ] Themes
  - [ ] Email verification
  - [ ] Rate limiting
- [ ] Email & password authentication

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

2. Install the dependencies:

    ```bash
    npm i
    ```

3. Create an .env file and fill in the required variables. You can enable/disable features at this point:

    ```bash
    cp sample.env .env
    ```

4. Fill in the required fields in the .env file using your favorite editor:

    ```bash
    vim .env
    ```

5. Generate the database migrations:

    ```bash
    npm run generate
    ```

6. Run the development server:

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

## [LICENSE](https://github.com/recoskyler/cici-panel/blob/main/LICENSE)

This template is under [The Unlicense License](https://github.com/recoskyler/cici-panel/blob/main/LICENSE).

## About

By [recoskyler](https://github.com/recoskyler) - September 2023

The name comes from "*Cici Bebe Bisküvisi*", a Turkish milk-biscuit snack for babies (*and adults*). **Would recommend**
