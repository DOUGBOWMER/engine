import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { getSDK } from '../../../../../helpers/index';
import { partialRouteSchema } from '../../../../../helpers/sharedApiSchemas';
import {
  allowanceRequestQuerySchema,
  allowanceRouteSchema,
  allowanceReplyBodySchema
} from "../../../../../schemas/erc20/standard/allowance";

export async function erc20Allowance(fastify: FastifyInstance) {
  fastify.route<allowanceRouteSchema>({
    method: 'GET',
    url: '/contract/:chain_name_or_id/:contract_address/erc20/allowance',
    schema: {
      description: "Get the allowance of another wallet address over the connected (Admin) wallet's funds.",
      tags: ['ERC20'],
      operationId: 'allowance',
      ...partialRouteSchema,
      querystring: allowanceRequestQuerySchema,
      response: {
        [StatusCodes.OK]: allowanceReplyBodySchema
      }
    },
    handler: async (request, reply) => {
      const { chain_name_or_id, contract_address } = request.params;
      const { spender_wallet } = request.query;

      const sdk = await getSDK(chain_name_or_id);
      const contract = await sdk.getContract(contract_address);

      const returnData: any = await contract.erc20.allowance(spender_wallet);
      
      reply.status(StatusCodes.OK).send({
        result: {
          data: returnData
        }
      });
    },
  });
}
