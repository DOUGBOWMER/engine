import fastifyCors from "@fastify/cors";
import { FastifyInstance } from "fastify";
import { env } from "../../utils/env";

export const withCors = async (server: FastifyInstance) => {
  const originArray = env.ACCESS_CONTROL_ALLOW_ORIGIN.split(",") as string[];
  await server.register(fastifyCors, {
    origin: originArray.map(sanitizeOrigin),
    credentials: true,
  });
};

export const sanitizeOrigin = (data: string): string | RegExp => {
  if (data.startsWith("/") && data.endsWith("/")) {
    return new RegExp(data.slice(1, -1));
  }

  if (data.startsWith("*.")) {
    const regex = data.replace("*.", ".*.");
    return new RegExp(regex);
  }

  if (data.includes("thirdweb-preview.com")) {
    return new RegExp(/^https?:\/\/.*\.thirdweb-preview\.com$/);
  }
  if (data.includes("thirdweb-dev.com")) {
    return new RegExp(/^https?:\/\/.*\.thirdweb-dev\.com$/);
  }

  // Remove trailing slashes.
  // The origin header does not include a trailing slash.
  if (data.endsWith("/")) {
    return data.slice(0, -1);
  }

  return data;
};
