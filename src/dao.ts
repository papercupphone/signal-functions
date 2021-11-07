import {DynamoDB} from 'aws-sdk'

const ddb = new DynamoDB.DocumentClient({apiVersion: '2012-08-10', region: process.env.AWS_REGION})

export default class Dao {

    deleteUserFromRoom = async (user: any) => {
        let room = await this.getRoom(user.room)
        if (room && room.Item) {
            let indexOfUser = room.Item.users.findIndex((i: string) => i === user.id)

            try {
                return await ddb.update({
                    ExpressionAttributeNames: {
                        "#users": "users"
                    },
                    Key: {
                        "name": user.room
                    },
                    TableName: process.env.ROOM_TABLE_NAME || "",
                    UpdateExpression: "REMOVE #users[" + indexOfUser + "]",
                    ReturnValues: "ALL_NEW",
                }).promise()
            } catch (err) {
                console.log(err)
            }
        }
    }

    getRoom = async (roomName: string) => {
        try {
            return await ddb.get({
                TableName: process.env.ROOM_TABLE_NAME || "",
                Key: {
                    'name': roomName
                }
            }).promise()
        } catch (err) {
            console.log(err)
        }
    }

    deleteFromUsers = async (connectionId?: string) => {
        try {
            await ddb.delete({
                    TableName: process.env.USER_TABLE_NAME || "",
                    Key: {
                        id: connectionId
                    }
                }
            ).promise()
        } catch (err) {
            console.log(err)
        }
    }

    getUser = async (connectionId?: string) => {
        try {
            return await ddb.get({
                TableName: process.env.USER_TABLE_NAME || "",
                Key: {
                    'id': connectionId
                }
            }).promise()
        } catch (err) {
            console.log(err)
        }
    }

    createUser = async (connectionId?: string) => {
        try {
            await ddb.put({
                TableName: process.env.USER_TABLE_NAME || "",
                Item: {
                    id: connectionId
                }
            }).promise()
        } catch (err) {
            return {statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(err)}
        }

        return {statusCode: 200, body: 'Connected.'}
    }

    createRoom = async (roomName: string, connectionId?: string) => {
        try {
            return await ddb.put({
                TableName: process.env.ROOM_TABLE_NAME || "",
                Item: {
                    "name": roomName,
                    "users": [connectionId]
                }
            }).promise()
        } catch (err) {
            console.log(err)
        }
    }

    addUserToRoom = async (roomName: string, connectionId?: string) => {
        try {
            return await ddb.update({
                TableName: process.env.ROOM_TABLE_NAME || "",
                Key: {
                    "name": roomName
                },
                UpdateExpression: "set #users = list_append(#users, :i)",
                ExpressionAttributeValues: {
                    ':i': [connectionId],
                },
                ExpressionAttributeNames: {
                    '#users': 'users'
                },
                ReturnValues: "UPDATED_NEW"
            }).promise()
        } catch (err) {
            console.log(err)
        }
    }

    updateUser = async (roomName: string, connectionId?: string) => {
        try {
            return await ddb.update({
                TableName: process.env.USER_TABLE_NAME || "",
                Key: {
                    "id": connectionId
                },
                UpdateExpression: "set #room = :r",
                ExpressionAttributeValues: {
                    ':r': roomName,
                },
                ExpressionAttributeNames: {
                    '#room': 'room'
                },
                ReturnValues: "UPDATED_NEW"
            }).promise()
        } catch (err) {
            console.log(err)
        }
    }
}
