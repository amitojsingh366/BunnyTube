import OperatorExecutor from "../../classes/OperatorExecutor";
import { Schema } from "../../operatorMiddleware/schema";
import authSchema from '../../schemas/user/auth.json';

const operator = new OperatorExecutor({
    name: 'user:auth'
})

operator.use(Schema(authSchema))

operator.setExecutor(async (client, payload) => {
    return client.send(JSON.stringify({
        op: `${operator.name}:reply`,
        data: {
            success: true
        }
    }))
})

export default operator;

