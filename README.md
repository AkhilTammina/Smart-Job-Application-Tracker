# JobTrack

A responsive job application tracker for keeping applications, interviews, and offers organized. JobTrack runs entirely in your browser; application data is stored in LocalStorage and is not sent to a server.

## Run locally

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To create and preview a production build:

```sh
npm run build
npm run preview
```

## Features

- Dashboard with application totals, response rate, recent applications, and upcoming interviews.
- Create, view, edit, search, filter, sort, and delete applications.
- Application status, location, salary, job URL, application date, interview date, and notes.
- Application activity and status analytics.
- Light/dark theme preference.
- JSON export and import. Import replaces the current list after confirmation.
- Sample applications on first launch. Existing saved data, including an intentionally empty list, is preserved.
- Responsive layouts and keyboard-accessible dialogs and controls.

## Data and privacy

Applications and theme preference are stored in this browser's LocalStorage. Clearing browser storage removes that data; export a JSON backup from **Settings** to keep a copy. Imported files must contain an array of JobTrack application records or an object with an `applications` array.
