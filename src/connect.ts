import Dao from './dao'

export default async function handler(event: any) {
 return await new Dao().createUser(event.requestContext.connectionId)
}
