import OperatorExecutor from "../../classes/OperatorExecutor";
import { Schema } from "../../operatorMiddleware/schema";
import authSchema from '../../schemas/user/auth.json';
import jwt from "jsonwebtoken";
import Password from "../../classes/Password";
import { v4 as uuidv4 } from 'uuid';
import { database } from "../../../prisma";

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

    await database.user.findUnique(
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
                    const verifiedToken = jwt.verify(payload.data.token, JWT_SECRET)
                    if (user.token.revoked) return client.ws.send(JSON.stringify({
                        code: 4006,
                        error: 'Token Expired'
                    }))
                    if (typeof verifiedToken === "string") return client.ws.send(JSON.stringify({
                        code: 4001,
                        error: 'Unauthorized'
                    }))
                    if (verifiedToken.jti !== user.token.jti) return client.ws.send(JSON.stringify({
                        code: 4001,
                        error: 'Unauthorized'
                    }))
                    if ((verifiedToken.exp || 0) < Date.now()) return client.ws.send(JSON.stringify({
                        code: 4006,
                        error: 'Token Expired'
                    }))
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

            const jti = uuidv4();
            const newToken = jwt.sign({
                jti,
                exp: Date.now() + 1296000000
            }, JWT_SECRET);

            await database.token.delete({ where: { jti: user.token?.jti } }).catch((e) => {
                return client.ws.send(JSON.stringify({
                    code: 4006,
                    error: e
                }))
            });

            await database.token.create({
                data: {
                    jti,
                    userId: user.id
                }
            }).catch((e) => {
                return client.ws.send(JSON.stringify({
                    code: 4006,
                    error: e
                }))
            })

            server.users.auth(user.id, client);

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

