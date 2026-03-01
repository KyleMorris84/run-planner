# Login Page + User Management API

This repo includes a log in page front end, along with a user management api.

The front end is a react app, built with vite, using tanstack router.

The api is a .net 10 webapp that connects to a postgres database that is ran separately in a container.

The api uses asp.net core identity and entity framework to manage the db.

## Features

The user can: 
- Log in
- Sign up
- View their profile
- Log out

The back end is fully authenticated using jwt access tokens & refresh tokens. This means:

- The user cannot call any endpoints except `/login` or `/signup` without an access token.
- The access token has a 1 minute lifetime, reducing the potential damage of stolen tokens.
- If the access token is expired, the next time the front end makes a request it will first call `/refresh` to get a new access token. If the refresh token is valid, the front end will then recieve a new access token.
- At this time, the client will also receive a new refresh token via an http-only cookie. This is to protect against any malicious js in the client stealing the refresh token - called an XSS attack.
- Refresh tokens have a lifetime of 1 day, at this time the user will be logged out and will need to log in again to receive a new access/refresh token pair.

The point of the refresh tokens is to allow the access tokens to have a short life span without forcing the user to log back in every time they expire.

## Running locally

1. Run the following in the root directory: `docker compose up -d`
2. Run the LogInPage Api project (https) in Visual Studio / Rider.
3. Run the following in the `\login-page` directory: `npm run dev`

## Future Improvements

- Use tanstack query for better error / pending handling on the front end
- Add some better error classes in the backend for more consistent handling on the front end
- Return jwt as a cookie instead of in the response body
