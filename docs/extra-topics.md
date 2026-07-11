# Extra topics

This file contains some extra topics that are helpful for development.

## 1. Databases and migrations

Juxtaposition currently uses two databases: postgresql (with prisma) and mongodb (with mongoose).
Mongodb is being phased out and replaced with postgresql.

Here are some situations which require extra steps to work with the databases, run all steps.

Before starting the app:
- `mongodb`: No steps required
- `postgresql`: Deploy the new migrations using `npm run migration:deploy`

Changing database models:
- `mongodb`: Automatic, no manual steps needed
- `postgresql`: Create a migration using `npm run migration:create` and deploy it using `npm run migration:deploy`

Creating a data migration:
- `mongodb`: Add a mongosh script to `/migrations`
- `postgresql`: Create a blank migration using `npm run migration:create` and fill it with your SQL script to do a data migration
- Cross-db data migrations: Create a NodeJS script in `/migrations` and give it a package.json for it's dependencies.
