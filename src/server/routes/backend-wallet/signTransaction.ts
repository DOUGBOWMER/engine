import { Static, Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import { getWallet } from "../../../utils/cache/getWallet";
import { walletAuthSchema } from "../../schemas/wallet";

const BodySchema = Type.Object({
  transaction: Type.Object({
    to: Type.Optional(Type.String()),
    from: Type.Optional(Type.String()),
    nonce: Type.Optional(Type.String()),
    gasLimit: Type.Optional(Type.String()),
    gasPrice: Type.Optional(Type.String()),
    data: Type.Optional(Type.String()),
    value: Type.Optional(Type.String()),
    chainId: Type.Optional(Type.Number()),
    type: Type.Optional(Type.Number()),
    accessList: Type.Optional(Type.Any()),
    maxFeePerGas: Type.Optional(Type.String()),
    maxPriorityFeePerGas: Type.Optional(Type.String()),
    customData: Type.Optional(Type.Record(Type.String(), Type.Any())),
    ccipReadEnabled: Type.Optional(Type.Boolean()),
  }),
});

const ReplySchema = Type.Object({
  result: Type.String(),
});

export async function signTransaction(fastify: FastifyInstance) {
  fastify.route<{
    Body: Static<typeof BodySchema>;
    Reply: Static<typeof ReplySchema>;
  }>({
    method: "POST",
    url: "/backend-wallet/sign-transaction",
    schema: {
      summary: "Sign a transaction",
      description: "Sign a transaction",
      tags: ["Backend Wallet"],
      operationId: "signTransaction",
      body: BodySchema,
      headers: Type.Omit(walletAuthSchema, ["x-account-address"]),
      response: {
        [StatusCodes.OK]: ReplySchema,
      },
    },
    handler: async (req, res) => {
      const { transaction } = req.body;
      const walletAddress = req.headers["x-backend-wallet-address"] as string;

      const wallet = await getWallet({
        chainId: 1,
        walletAddress,
      });

      const signer = await wallet.getSigner();
      const signedMessage = await signer.signTransaction(transaction);

      res.status(200).send({
        result: signedMessage,
      });
    },
  });
}
