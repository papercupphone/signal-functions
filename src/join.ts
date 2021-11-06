import {ApiGatewayManagementApi} from 'aws-sdk'
import twilio from 'twilio'
import Dao from './dao'

const dao = new Dao()

export default async function handler(event: any) {
    const apiGatewayManagementApi = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
    })

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    let token = await client.tokens.create()

    let postData = JSON.parse(event.body)
    let room = await dao.getRoom(postData.room.name)

    if (room && !room.Item) {
        await dao.createRoom(postData.room.name, event.requestContext.connectionId)
    } else {
        await dao.addUserToRoom(postData.room.name, event.requestContext.connectionId)
    }

    await dao.updateUser(postData.room.name, event.requestContext.connectionId)
    await userJoinedToRoom(apiGatewayManagementApi, postData.room.name, event.requestContext.connectionId, token)

    return {statusCode: 200, body: 'Done.'}
}


const userJoinedToRoom = async (apiGatewayManagementApi: ApiGatewayManagementApi, roomName: string, connectionId: string, token: any) => {

    let room = await dao.getRoom(roomName)

    if (room && room.Item) {
        for (let id of room.Item.users) {
            try {
                if (id !== connectionId) {
                    await apiGatewayManagementApi.postToConnection({
                        ConnectionId: id,
                        Data: JSON.stringify({
                            joined: {
                                id: connectionId
                            }
                        })
                    }).promise()
                } else {
                    await apiGatewayManagementApi.postToConnection({
                        ConnectionId: id,
                        Data: JSON.stringify({
                            me: {
                                id: connectionId
                            },
                            token,
                            peers: room.Item.users
                        })
                    }).promise()
                }
            } catch (e) {
                console.log(e)
            }
        }
    }
}
