import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import { getSDK } from "../../../../../helpers/index";
import {
  baseReplyErrorSchema,
  contractParamSchema,
} from "../../../../../helpers/sharedApiSchemas";
import { Static, Type } from "@sinclair/typebox";

// INPUT
const requestSchema = contractParamSchema;

// OUPUT
const responseSchema = Type.Object({
  result: Type.Optional(Type.String()),
  error: Type.Optional(baseReplyErrorSchema),
});

// LOGIC
export async function erc721TotalClaimedSupply(fastify: FastifyInstance) {
  fastify.route<{
    Params: Static<typeof requestSchema>;
    Reply: Static<typeof responseSchema>;
  }>({
    method: "GET",
    url: "/contract/:chain_name_or_id/:contract_address/erc721/totalClaimedSupply",
    schema: {
      description: "Get the claimed NFT supply for the contract.",
      tags: ["ERC721"],
      operationId: "erc721_totalClaimedSupply",
      params: requestSchema,
      response: {
        [StatusCodes.OK]: responseSchema,
      },
    },
    handler: async (request, reply) => {
      const { chain_name_or_id, contract_address } = request.params;
      const sdk = await getSDK(chain_name_or_id);
      const contract = await sdk.getContract(contract_address);
      const returnData = await contract.erc721.totalClaimedSupply();
      reply.status(StatusCodes.OK).send({
        result: returnData.toString(),
      });
    },
  });
}
