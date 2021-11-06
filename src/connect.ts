import Dao from './dao'

export async function handler(event: any) {
 return await new Dao().createUser(event.requestContext.connectionId)
}
