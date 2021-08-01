import OperatorExecutor from "../../classes/OperatorExecutor";
import { Schema } from "../../operatorMiddleware/schema";
import authSchema from '../../schemas/user/auth.json';
import jwt from "jsonwebtoken";
import Password from "../../classes/Password";

const operator = new OperatorExecutor({
    name: 'user:auth'
})

operator.use(Schema(authSchema))

operator.setExecutor(async (server, client, payload) => {
    const JWT_SECRET = process.env.JWT_SECRET || "";

    if (!payload.data.token && !payload.data.password) return client.ws.send(JSON.stringify({
        code: 4001,
        error: 'Unauthorized'
    }));

    await server.database.user.findUnique(
        {
            where: { username: payload.data.username },
            select: { id: true, token: true, password: true }
        }).then(async (user) => {
            if (user == null) return client.ws.send(JSON.stringify({
                code: 4004,
                error: 'User Not Found'
            }));


            if (user.token && payload.data.token) {
                try {
                    const a = jwt.verify(user.token.token, JWT_SECRET)
                    const b = jwt.verify(payload.data.token, JWT_SECRET)
                    if (user.token.revoked) return client.ws.send(JSON.stringify({
                        code: 4006,
                        error: 'Token Expired'
                    }))
                    if (typeof a !== "string" && typeof b !== "string") {
                        if (a.jti !== b.jti) return client.ws.send(JSON.stringify({
                            code: 4001,
                            error: 'Unauthorized'
                        }))
                        if ((b.exp || 0) < Date.now()) return client.ws.send(JSON.stringify({
                            code: 4006,
                            error: 'Token Expired'
                        }))
                    } else {
                        if (a !== b) return client.ws.send(JSON.stringify({
                            code: 4001,
                            error: 'Unauthorized'
                        }))
                    }
                } catch (error) {
                    return client.ws.send(JSON.stringify({
                        code: 4000,
                        error
                    }));
                }

            }
            if (payload.data.password) {
                if (!Password.validate(payload.data.password, user.password)) return client.ws.send(JSON.stringify({
                    code: 4001,
                    error: 'Unauthorized'
                }))
            }

            const newToken = jwt.sign({
                id: payload.data.username, data: {
                    hash: Password.hash(payload.data.username)
                }
            }, JWT_SECRET, { expiresIn: '15 days' });

            await server.database.user.update({
                where: { username: payload.data.username }, data: {
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

            await server.database.authedUsers.create({
                data: {
                    wsId: client.id,
                    userId: user.id
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
})

export default operator;

