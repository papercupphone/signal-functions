import { ApiGatewayManagementApi } from 'aws-sdk';
import Dao from './dao';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const apiGatewayManagementApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
  });
  let dao = new Dao();
  let user = await dao.getUser(event.requestContext.connectionId);
  if (user) {
    await dao.deleteUserFromRoom(user.Item);
    await dao.deleteFromUsers(event.requestContext.connectionId);
    await userDisconnectedToRoom(dao, apiGatewayManagementApi, user.Item);
    return { statusCode: 200, body: 'disconnect::Disconnected.' };
  } else {
    return { statusCode: 400, body: 'disconnect::User not found.' };
  }
};

const userDisconnectedToRoom = async (dao: Dao, apiGatewayManagementApi: ApiGatewayManagementApi, user: any) => {
  if (user.room) {
    let room = await dao.getRoom(user.room);

    if (room && room.Item) {
      for (let id of room.Item.users) {
        try {
          if (id !== user.id) {
            await apiGatewayManagementApi
              .postToConnection({
                ConnectionId: id,
                Data: JSON.stringify({
                  disconnected: {
                    id: user.id,
                  },
                }),
              })
              .promise();
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
  }
};
