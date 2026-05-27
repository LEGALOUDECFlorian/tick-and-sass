import http from "http";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import { resolvers } from "./resolvers/resolver.js";
import { createLoaders } from "./graphql/loaders.js";
import { prisma } from "./datasources/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const typeDefs = readFileSync(path.join(__dirname, "./schemas/schema.graphql"), "utf8");

async function main() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  // Compteur d'appels Prisma émise par requête
  let prismaQueryCount = 0;

  // Total des requêtes SQL émise par Prisma
  prisma.$on("query", (e) => {
    if (e.query.trim() === 'SELECT 1') return;
    prismaQueryCount++;
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      {
        async requestDidStart() {
          return {
            async willSendResponse() {
              console.log("Total requêtes Prisma pour cette requête GraphQL :", prismaQueryCount);
            },
          };
        },
      },
    ],
  });
  await server.start();

  app.use(
    "/graphql",
    (req, res, next) => {
      prismaQueryCount = 0;
      next();
    },
    expressMiddleware(server, {
      context: async () => ({
       loaders: createLoaders(), 
      }),
    })
  );

  const httpServer = http.createServer(app);
  const port = Number(process.env.PORT) || 4000;
  httpServer.listen(port, () => {
    console.log(`✅ GraphQL sur http://localhost:${port}/graphql`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
