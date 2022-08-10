import Dao from './dao';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.body) {
    let body = JSON.parse(event.body);
    let dao = new Dao();
    let user = await dao.getUser(body.connectionId);
    if (user) {
      await dao.deleteUserFromRoom(user.Item);
      await dao.deleteFromUsers(body.connectionId);
      return { statusCode: 200, body: 'leave::Disconnected.' };
    } else {
      return { statusCode: 400, body: 'leave::User not found.' };
    }
  } else {
    return { statusCode: 400, body: 'leave::Bad request' };
  }
};
