import {ApiGatewayManagementApi} from "aws-sdk"
import Dao from "./dao"
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const apiGatewayManagementApi = new ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: event.requestContext.domainName + "/" + event.requestContext.stage
    })

    let connectionId = event.requestContext.connectionId
    let postData = JSON.parse(event.body!)
    postData.message.sender = connectionId

    if (postData.message.to) {
        await apiGatewayManagementApi.postToConnection({
            ConnectionId: postData.message.to,
            Data: JSON.stringify(postData.message)
        }).promise()
    } else {
        let dao = new Dao()
        let user = await dao.getUser(connectionId)
        if (user && user.Item) {
            let room = await dao.getRoom(user.Item.room)
            if (room && room.Item) {
                for (let id of room.Item.users) {
                    try {
                        if (id !== connectionId) {
                            await apiGatewayManagementApi.postToConnection({
                                ConnectionId: id,
                                Data: JSON.stringify(postData.message)
                            }).promise()
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        }

    }

    return {statusCode: 200, body: "message::Done."}
}
