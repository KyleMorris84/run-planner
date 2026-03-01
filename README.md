# Run Planner

This is a simple webapp that allows users to draw a path along a map and view the elavation change along that path. Map is restricted to the UK and Ireland. This ranges specifically from latitudes 50 to 60 and longitudes -10 to 5.

# Setup

## Docker

To run the postgres users db, run `docker compose up -d` in the root directory. This will expose the db on port 5432 and open-elevation on port 80.

To run the user management API, run the Api project inside `LogInPage.sln` in the `LogInPage` directory. The api runs on port 7204.

## Client

To run the client web app you will need node. Then run `npm install` and `npm run dev`. This will run the frontend on http://localhost:3000/.

