export class ObiTransformer {
    toDirectedGraphSchema(obiJson) {
        return {
            nodes: [{id: 1, name: 'root'}, {id: 2, name: 'child'}],
            edges: [{from: 1, to: 2, name: 'goto', arrowhead: 'normal'}]
        }
    }
}