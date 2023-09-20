import { Static, Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import { walletAuthSchema } from "../../../../../../core/schema";
import { queueTx } from "../../../../../../src/db/transactions/queueTx";
import {
  erc1155ContractParamSchema,
  standardResponseSchema,
  transactionWritesResponseSchema,
} from "../../../../../helpers/sharedApiSchemas";
import { txOverridesForWriteRequest } from "../../../../../schemas/web3api-overrides";
import { getChainIdFromChain } from "../../../../../utilities/chain";
import { getContract } from "../../../../../utils/cache/getContract";

// INPUTS
const requestSchema = erc1155ContractParamSchema;
const requestBodySchema = Type.Object({
  to: Type.String({
    description: "Address of the wallet to transfer to",
  }),
  token_id: Type.String({
    description: "the tokenId to transfer",
  }),
  amount: Type.String({
    description: "the amount of tokens to transfer",
  }),
  ...txOverridesForWriteRequest.properties,
});

requestBodySchema.examples = [
  {
    to: "0x3EcDBF3B911d0e9052b64850693888b008e18373",
    token_id: "0",
    amount: "1",
  },
];

export async function erc1155transfer(fastify: FastifyInstance) {
  fastify.route<{
    Params: Static<typeof requestSchema>;
    Reply: Static<typeof transactionWritesResponseSchema>;
    Body: Static<typeof requestBodySchema>;
  }>({
    method: "POST",
    url: "/contract/:network/:contract_address/erc1155/transfer",
    schema: {
      description:
        "Transfer an NFT from the connected wallet to another wallet.",
      tags: ["ERC1155"],
      operationId: "erc1155_transfer",
      params: requestSchema,
      headers: walletAuthSchema,
      body: requestBodySchema,
      response: {
        ...standardResponseSchema,
        [StatusCodes.OK]: transactionWritesResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { network, contract_address } = request.params;
      const { to, token_id, amount } = request.body;
      const walletAddress = request.headers["x-wallet-address"] as string;
      const chainId = getChainIdFromChain(network);
      const contract = await getContract({
        chainId,
        contractAddress: contract_address,
        walletAddress,
      });

      const tx = await contract.erc1155.transfer.prepare(to, token_id, amount);
      const queuedId = await queueTx({ tx, chainId, extension: "erc1155" });
      reply.status(StatusCodes.OK).send({
        result: queuedId,
      });
    },
  });
}
