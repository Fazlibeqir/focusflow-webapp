# FocusFlow

FocusFlow is a lightweight productivity dashboard for planning the day, tracking tasks, and running focused work sessions.

## Features

- Daily task list with completion progress
- New-task flow with browser storage persistence
- 25-minute focus timer with pause, reset, and skip controls
- Weekly focus activity visualization
- Responsive layout for smaller screens

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Test

```bash
npm test
```

The test command checks the syntax of the server and browser JavaScript. Also smoke-test the task list and timer in a browser after UI changes.

## Project structure

- `index.js` - Express static-file server
- `public/index.html` - dashboard markup
- `public/app.js` - task and timer behavior
- `public/styles.css` - responsive visual styling
