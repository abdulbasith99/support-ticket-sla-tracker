import {
  createSchema,
  createYoga,
} from "graphql-yoga";

import { readFileSync } from "node:fs";

import {
  getCurrentUser,
} from "./auth";

import { resolvers } from "./graphql/resolvers";

const typeDefs = readFileSync(
  new URL(
    "./graphql/schema/schema.graphql",
    import.meta.url,
  ),
  "utf8",
);

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,

  graphqlEndpoint: "/graphql",

  context: async ({ request }) => {
    const currentUser =
      await getCurrentUser(
        request.headers.get(
          "authorization",
        ),
      );

    return {
      currentUser,
    };
  },
});

const port = Number(
  process.env.PORT ?? 4000,
);

const server = Bun.serve({
  port,
  fetch: yoga,
});

console.log(
  `GraphQL API running at http://localhost:${server.port}/graphql`,
);