"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Loop_Agentflow {
    constructor() {
        //@ts-ignore
        this.loadMethods = {
            async listPreviousNodes(_, options) {
                const previousNodes = options.previousNodes;
                const returnOptions = [];
                for (const node of previousNodes) {
                    returnOptions.push({
                        label: node.label,
                        name: `${node.id}-${node.label}`,
                        description: node.id
                    });
                }
                return returnOptions;
            }
        };
        this.label = 'Loop';
        this.name = 'loopAgentflow';
        this.version = 1.0;
        this.type = 'Loop';
        this.category = 'Agent Flows';
        this.description = 'Loop back to a previous node';
        this.baseClasses = [this.type];
        this.color = '#FFA07A';
        this.hint = 'Make sure to have memory enabled in the LLM/Agent node to retain the chat history';
        this.hideOutput = true;
        this.inputs = [
            {
                label: 'Loop Back To',
                name: 'loopBackToNode',
                type: 'asyncOptions',
                loadMethod: 'listPreviousNodes',
                freeSolo: true
            },
            {
                label: 'Max Loop Count',
                name: 'maxLoopCount',
                type: 'number',
                default: 5
            }
        ];
    }
    async run(nodeData, _, options) {
        const loopBackToNode = nodeData.inputs?.loopBackToNode;
        const _maxLoopCount = nodeData.inputs?.maxLoopCount;
        const state = options.agentflowRuntime?.state;
        const loopBackToNodeId = loopBackToNode.split('-')[0];
        const loopBackToNodeLabel = loopBackToNode.split('-')[1];
        const data = {
            nodeID: loopBackToNodeId,
            maxLoopCount: _maxLoopCount ? parseInt(_maxLoopCount) : 5
        };
        const returnOutput = {
            id: nodeData.id,
            name: this.name,
            input: data,
            output: {
                content: 'Loop back to ' + `${loopBackToNodeLabel} (${loopBackToNodeId})`,
                nodeID: loopBackToNodeId,
                maxLoopCount: _maxLoopCount ? parseInt(_maxLoopCount) : 5
            },
            state
        };
        return returnOutput;
    }
}
module.exports = { nodeClass: Loop_Agentflow };
//# sourceMappingURL=Loop.js.map