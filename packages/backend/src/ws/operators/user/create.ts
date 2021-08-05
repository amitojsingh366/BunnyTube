import OperatorExecutor from "../../classes/OperatorExecutor";
import { Schema } from "../../operatorMiddleware/schema";
import createSchema from '../../schemas/user/create.json';
import Password from "../../classes/Password";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { database } from "../../../prisma";
import { Ping } from "../../operatorMiddleware/ping";

const operator = new OperatorExecutor({
    name: 'user:create'
})

operator.use(Ping());
operator.use(Schema(createSchema))

operator.setExecutor(async (server, client, payload) => {
    const JWT_SECRET = process.env.JWT_SECRET || "";
    await database.user.findUnique({ where: { username: payload.data.username } }).then(async (user) => {
        if (user !== null) return operator.reply(client, payload, {
            success: false,
            code: 4000,
            error: 'User Already Exists'
        })

        const jti = uuidv4();

        const newToken = jwt.sign({
            jti,
            exp: Date.now() + 1296000000
        }, JWT_SECRET);

        await database.user.create({
            data: {
                username: payload.data.username,
                name: payload.data.name,
                password: Password.hash(payload.data.password),
                email: payload.data.email ?? null
            }
        }).then(async (user) => {

            await database.token.create({
                data: {
                    jti,
                    userId: user.id
                }
            })

            return operator.reply(client, payload, {
                success: true,
                token: newToken
            })
        }).catch((e) => {
            return operator.reply(client, payload, {
                success: false,
                code: 4006,
                error: e
            })
        })
    })
})

export default operator;

