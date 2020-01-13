# Top Kamera - Solution API

TODO information

## Technical

The API is developed on to of GraphQL and uses it as it's core. GraphQL provides a single-entrypoint server-frontend model to retrieve and create data. It also has it's own DSL (Domain Specific Language) which would help non-developers and developers to work together.

### Structure

- `app/` directory holds everything need to run the API.
- `app/helpers` is where any additional utility library, helper or service would reside.
- `app/models` will give you mongodb/mongoose models along with their schema residing in.
- `app/queries` has `Query/Mutation` available for each entity. If it's a `Query`, then file should end with `<queryName>Query.js` and similarly to mutation `<mutationName>Mutation.js`
- `app/resolvers` are pure javascript functions to resolve the fields. File names should match the query/mutation.
- `app/types` holds all the distinctive types we have in the application.

### Setup

You could also run the following command:

```
$ cp .env.example .env
```

