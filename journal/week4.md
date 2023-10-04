# Week 4 — Postgres and RDS

The flow of data within the app architecture is crucial in understanding how users are set.

One of the issues was that 'andrewbrown' was hardcoded in multiple places as the user handle in the app.

What the application does to verify a user is logged in is:

Checks the user against the Cognito User Pool.
Checks to see if the user is listed in the RDS instance, in the 'users' table.
Retrieves the handle and retrieves activities data from this database.

The problem I was running into was that my users table data was not populated with the Cognito User Pool data. So I had to in fact create users in the Cognito User Pool, in order to then pull that data through and update the users table correctly, and retrieve the seed data that I had seeded my database with.