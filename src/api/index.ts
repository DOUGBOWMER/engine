import { FastifyInstance } from "fastify";
import { readContract } from "./contract/read/read";
import { writeToContract } from "./contract/write/write";

// Extensions
import { erc20Routes } from "./contract/extensions/erc20/index";
import { deployPrebuilt } from "./deployer/prebuilt";
import { deployPublished } from "./deployer/published";

export const apiRoutes = async (fastify: FastifyInstance) => {
  // deployer
  await fastify.register(deployPrebuilt);
  await fastify.register(deployPublished);

  // generic
  await fastify.register(readContract);
  await fastify.register(writeToContract);

  // ERC20
  await fastify.register(erc20Routes);
};
