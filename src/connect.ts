import Dao from "./dao"
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return await new Dao().createUser(event.requestContext.connectionId)
}
