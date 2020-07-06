import config from "../config";
import { GraphQLServer } from "graphql-yoga";
import schema from "./schema";
import logger from "morgan";
import "./passport";
import { authenticateJwt } from "./passport";
import { isAuthenticated } from "./middlewares";
import winston from "../config/winston";

const PORT = config.port || 4000;
const server = new GraphQLServer({
  schema,
  context: ({ request }) => ({ request, isAuthenticated }),
});

server.express.use(logger("dev"));
server.express.use(authenticateJwt);

server.start({ port: PORT }, () => {
  winston.debug(`Server running on  http://localhost:${PORT}✅`);
});
