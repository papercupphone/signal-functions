import Dao from './dao';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent | string): Promise<APIGatewayProxyResult | string> => {
  if (typeof event === 'string') {
    return event;
  }
  return await new Dao().createUser(event.requestContext.connectionId);
};
