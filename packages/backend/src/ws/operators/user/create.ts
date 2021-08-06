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

    const validUsername = /^[a-zA-Z0-9]+$/.test(payload.data.username);
    if (!validUsername) return operator.reply(client, payload, {
        success: false,
        code: 4000,
        error: 'Invalid Username'
    });

    if (payload.data.email) {
        const validEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            .test(payload.data.email);

        if (!validEmail) return operator.reply(client, payload, {
            success: false,
            code: 4000,
            error: 'Invalid Email'
        });
    }

    const validPassword = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/.test(payload.data.password);
    if (!validPassword) return operator.reply(client, payload, {
        success: false,
        code: 4000,
        error: 'Invalid Password'
    });


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

