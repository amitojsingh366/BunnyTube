import OperatorExecutor from "../../classes/OperatorExecutor";
import { Schema } from "../../operatorMiddleware/schema";
import createSchema from '../../schemas/user/create.json';
import Password from "../../classes/Password";
import jwt from "jsonwebtoken";


const operator = new OperatorExecutor({
    name: 'user:create'
})

operator.use(Schema(createSchema))

operator.setExecutor(async (server, client, payload) => {
    const JWT_SECRET = process.env.JWT_SECRET || "";
    server.database.user.findUnique({ where: { username: payload.data.username } }).then((user) => {
        if (user !== null) return client.ws.send(JSON.stringify({
            code: 4000,
            error: 'User Already Exists'
        }))
    })

    const newToken = jwt.sign({
        id: payload.data.username, data: {
            hash: Password.hash(payload.data.username)
        }
    }, JWT_SECRET, { expiresIn: '15 days' });

    await server.database.user.create({
        data: {
            username: payload.data.username,
            name: payload.data.name,
            password: Password.hash(payload.data.password),
            email: payload.data.email ?? "",
            token: {
                create: {
                    token: newToken
                }
            }
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
            success: true,
            token: newToken
        }
    }))
})

export default operator;

