import OperatorExecutor from "../../classes/OperatorExecutor";
import { Schema } from "../../operatorMiddleware/schema";
import createSchema from '../../schemas/user/create.json';
import Password from "../../classes/Password";

const operator = new OperatorExecutor({
    name: 'user:create'
})

operator.use(Schema(createSchema))

operator.setExecutor(async (server, client, payload) => {

    server.database.user.findUnique({ where: { username: payload.data.username } }).then((user) => {
        if (user) return client.ws.send(JSON.stringify({
            code: 4000,
            error: 'Bad Request'
        }))
    })

    await server.database.user.create({
        data: {
            username: payload.data.username,
            name: payload.data.name,
            password: Password.hash(payload.data.password),
            email: payload.data.email ?? ""
        }
    }).catch((e) => {
        return client.ws.send(JSON.stringify({
            code: 4006,
            error: e
        }))
    })

    return client.ws.send(JSON.stringify({
        op: `${operator.name}:reply`,
        data: {
            success: true
        }
    }))
})

export default operator;

