import OperatorExecutor from "../../classes/OperatorExecutor";
import { Schema } from "../../operatorMiddleware/schema";
import createSchema from '../../schemas/user/create.json';

const operator = new OperatorExecutor({
    name: 'user:create'
})

operator.use(Schema(createSchema))

operator.setExecutor(async (client, payload) => {
    return client.send(JSON.stringify({
        op: `${operator.name}:reply`,
        data: {
            success: true
        }
    }))
})

export default operator;

