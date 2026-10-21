# FocusFlow project guidelines

## Architecture

- Keep the existing small Express server in `index.js` responsible only for serving `public/`.
- Put browser behavior in `public/app.js` and visual styling in `public/styles.css`.
- Prefer browser APIs and the existing dependency set; do not add a framework for small UI changes.

## Code style

- Use plain JavaScript with `const`/`let`, descriptive names, and early returns.
- Preserve the current visual language, responsive layout, and localStorage task persistence.
- Keep user-facing labels accessible and use buttons for actions.
- Add comments only for behavior that is not clear from the code.

## Build and test

- Install dependencies with `npm install`.
- Start the app with `npm start` and open `http://localhost:3000`.
- Run `npm test` after JavaScript changes. This performs syntax checks for the server and browser script.
- Manually smoke-test task completion, adding a task, timer controls, responsive layout, and refresh persistence.

## Scope

- FocusFlow is a lightweight personal productivity dashboard, not the workshop's Space Quiz.
- Avoid changing the product concept or replacing the Express setup without explicit approval.
