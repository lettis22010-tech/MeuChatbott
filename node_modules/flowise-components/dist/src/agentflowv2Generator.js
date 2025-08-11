"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAgentflowv2 = void 0;
const zod_1 = require("zod");
const output_parsers_1 = require("@langchain/core/output_parsers");
const lodash_1 = require("lodash");
const ToolType = zod_1.z.array(zod_1.z.string()).describe('List of tools');
// Define a more specific NodePosition schema
const NodePositionType = zod_1.z.object({
    x: zod_1.z.number().describe('X coordinate of the node position'),
    y: zod_1.z.number().describe('Y coordinate of the node position')
});
// Define a more specific EdgeData schema
const EdgeDataType = zod_1.z.object({
    edgeLabel: zod_1.z.string().optional().describe('Label for the edge')
});
// Define a basic NodeData schema to avoid using .passthrough() which might cause issues
const NodeDataType = zod_1.z
    .object({
    label: zod_1.z.string().optional().describe('Label for the node'),
    name: zod_1.z.string().optional().describe('Name of the node')
})
    .optional();
const NodeType = zod_1.z.object({
    id: zod_1.z.string().describe('Unique identifier for the node'),
    type: zod_1.z.enum(['agentFlow']).describe('Type of the node'),
    position: NodePositionType.describe('Position of the node in the UI'),
    width: zod_1.z.number().describe('Width of the node'),
    height: zod_1.z.number().describe('Height of the node'),
    selected: zod_1.z.boolean().optional().describe('Whether the node is selected'),
    positionAbsolute: NodePositionType.optional().describe('Absolute position of the node'),
    data: NodeDataType
});
const EdgeType = zod_1.z.object({
    id: zod_1.z.string().describe('Unique identifier for the edge'),
    type: zod_1.z.enum(['agentFlow']).describe('Type of the node'),
    source: zod_1.z.string().describe('ID of the source node'),
    sourceHandle: zod_1.z.string().describe('ID of the source handle'),
    target: zod_1.z.string().describe('ID of the target node'),
    targetHandle: zod_1.z.string().describe('ID of the target handle'),
    data: EdgeDataType.optional().describe('Data associated with the edge')
});
const NodesEdgesType = zod_1.z
    .object({
    description: zod_1.z.string().optional().describe('Description of the workflow'),
    usecases: zod_1.z.array(zod_1.z.string()).optional().describe('Use cases for this workflow'),
    nodes: zod_1.z.array(NodeType).describe('Array of nodes in the workflow'),
    edges: zod_1.z.array(EdgeType).describe('Array of edges connecting the nodes')
})
    .describe('Generate Agentflowv2 nodes and edges');
const generateAgentflowv2 = async (config, question, options) => {
    try {
        const result = await generateNodesEdges(config, question, options);
        const { nodes, edges } = generateNodesData(result, config);
        const updatedNodes = await generateSelectedTools(nodes, config, question, options);
        const updatedEdges = updateEdges(edges, nodes);
        return { nodes: updatedNodes, edges: updatedEdges };
    }
    catch (error) {
        console.error('Error generating AgentflowV2:', error);
        return { error: error.message || 'Unknown error occurred' };
    }
};
exports.generateAgentflowv2 = generateAgentflowv2;
const updateEdges = (edges, nodes) => {
    const isMultiOutput = (source) => {
        return source.includes('conditionAgentflow') || source.includes('conditionAgentAgentflow') || source.includes('humanInputAgentflow');
    };
    const findNodeColor = (nodeId) => {
        const node = nodes.find((node) => node.id === nodeId);
        return node?.data?.color;
    };
    // filter out edges that do not exist in nodes
    edges = edges.filter((edge) => {
        return nodes.some((node) => node.id === edge.source || node.id === edge.target);
    });
    // filter out the edge that has hideInput/hideOutput on the source/target node
    const indexToDelete = [];
    for (let i = 0; i < edges.length; i += 1) {
        const edge = edges[i];
        const sourceNode = nodes.find((node) => node.id === edge.source);
        if (sourceNode?.data?.hideOutput) {
            indexToDelete.push(i);
        }
        const targetNode = nodes.find((node) => node.id === edge.target);
        if (targetNode?.data?.hideInput) {
            indexToDelete.push(i);
        }
    }
    // delete the edges at the index in indexToDelete
    for (let i = indexToDelete.length - 1; i >= 0; i -= 1) {
        edges.splice(indexToDelete[i], 1);
    }
    const updatedEdges = edges.map((edge) => {
        return {
            ...edge,
            data: {
                ...edge.data,
                sourceColor: findNodeColor(edge.source),
                targetColor: findNodeColor(edge.target),
                edgeLabel: isMultiOutput(edge.source) && edge.label && edge.label.trim() !== '' ? edge.label.trim() : undefined,
                isHumanInput: edge.source.includes('humanInputAgentflow') ? true : false
            },
            type: 'agentFlow',
            id: `${edge.source}-${edge.sourceHandle}-${edge.target}-${edge.targetHandle}`
        };
    });
    if (updatedEdges.length > 0) {
        updatedEdges.forEach((edge) => {
            if (isMultiOutput(edge.source)) {
                if (edge.sourceHandle.includes('true')) {
                    edge.sourceHandle = edge.sourceHandle.replace('true', '0');
                }
                else if (edge.sourceHandle.includes('false')) {
                    edge.sourceHandle = edge.sourceHandle.replace('false', '1');
                }
            }
        });
    }
    return updatedEdges;
};
const generateSelectedTools = async (nodes, config, question, options) => {
    const selectedTools = [];
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (!node.data.inputs) {
            node.data.inputs = {};
        }
        if (node.data.name === 'agentAgentflow') {
            const sysPrompt = `You are a workflow orchestrator that is designed to make agent coordination and execution easy. Your goal is to select the tools that are needed to achieve the given task.

Here are the tools to choose from:
${config.toolNodes}

Here's the selected tools:
${JSON.stringify(selectedTools, null, 2)}

Output Format should be a list of tool names:
For example:["googleCustomSearch", "slackMCP"]

Now, select the tools that are needed to achieve the given task. You must only select tools that are in the list of tools above. You must NOT select the tools that are already in the list of selected tools.
`;
            const tools = await _generateSelectedTools({ ...config, prompt: sysPrompt }, question, options);
            if (Array.isArray(tools) && tools.length > 0) {
                selectedTools.push(...tools);
                const existingTools = node.data.inputs.agentTools || [];
                node.data.inputs.agentTools = [
                    ...existingTools,
                    ...tools.map((tool) => ({
                        agentSelectedTool: tool,
                        agentSelectedToolConfig: {
                            agentSelectedTool: tool
                        }
                    }))
                ];
            }
        }
        else if (node.data.name === 'toolAgentflow') {
            const sysPrompt = `You are a workflow orchestrator that is designed to make agent coordination and execution easy. Your goal is to select ONE tool that is needed to achieve the given task.

Here are the tools to choose from:
${config.toolNodes}

Here's the selected tools:
${JSON.stringify(selectedTools, null, 2)}

Output Format should ONLY one tool name inside of a list:
For example:["googleCustomSearch"]

Now, select the ONLY tool that is needed to achieve the given task. You must only select tool that is in the list of tools above. You must NOT select the tool that is already in the list of selected tools.
`;
            const tools = await _generateSelectedTools({ ...config, prompt: sysPrompt }, question, options);
            if (Array.isArray(tools) && tools.length > 0) {
                selectedTools.push(...tools);
                node.data.inputs.toolAgentflowSelectedTool = tools[0];
                node.data.inputs.toolInputArgs = [];
                node.data.inputs.toolAgentflowSelectedToolConfig = {
                    toolAgentflowSelectedTool: tools[0]
                };
            }
        }
    }
    return nodes;
};
const _generateSelectedTools = async (config, question, options) => {
    try {
        const chatModelComponent = config.componentNodes[config.selectedChatModel?.name];
        if (!chatModelComponent) {
            throw new Error('Chat model component not found');
        }
        const nodeInstanceFilePath = chatModelComponent.filePath;
        const nodeModule = await Promise.resolve(`${nodeInstanceFilePath}`).then(s => __importStar(require(s)));
        const newToolNodeInstance = new nodeModule.nodeClass();
        const model = (await newToolNodeInstance.init(config.selectedChatModel, '', options));
        // Create a parser to validate the output
        const parser = output_parsers_1.StructuredOutputParser.fromZodSchema(ToolType);
        // Generate JSON schema from our Zod schema
        const formatInstructions = parser.getFormatInstructions();
        // Full conversation with system prompt and instructions
        const messages = [
            {
                role: 'system',
                content: `${config.prompt}\n\n${formatInstructions}\n\nMake sure to follow the exact JSON schema structure.`
            },
            {
                role: 'user',
                content: question
            }
        ];
        // Standard completion without structured output
        const response = await model.invoke(messages);
        // Try to extract JSON from the response
        const responseContent = response.content.toString();
        const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/{[\s\S]*?}/);
        if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            try {
                const parsedJSON = JSON.parse(jsonStr);
                // Validate with our schema
                return ToolType.parse(parsedJSON);
            }
            catch (parseError) {
                console.error('Error parsing JSON from response:', parseError);
                return { error: 'Failed to parse JSON from response', content: responseContent };
            }
        }
        else {
            console.error('No JSON found in response:', responseContent);
            return { error: 'No JSON found in response', content: responseContent };
        }
    }
    catch (error) {
        console.error('Error generating AgentflowV2:', error);
        return { error: error.message || 'Unknown error occurred' };
    }
};
const generateNodesEdges = async (config, question, options) => {
    try {
        const chatModelComponent = config.componentNodes[config.selectedChatModel?.name];
        if (!chatModelComponent) {
            throw new Error('Chat model component not found');
        }
        const nodeInstanceFilePath = chatModelComponent.filePath;
        const nodeModule = await Promise.resolve(`${nodeInstanceFilePath}`).then(s => __importStar(require(s)));
        const newToolNodeInstance = new nodeModule.nodeClass();
        const model = (await newToolNodeInstance.init(config.selectedChatModel, '', options));
        // Create a parser to validate the output
        const parser = output_parsers_1.StructuredOutputParser.fromZodSchema(NodesEdgesType);
        // Generate JSON schema from our Zod schema
        const formatInstructions = parser.getFormatInstructions();
        // Full conversation with system prompt and instructions
        const messages = [
            {
                role: 'system',
                content: `${config.prompt}\n\n${formatInstructions}\n\nMake sure to follow the exact JSON schema structure.`
            },
            {
                role: 'user',
                content: question
            }
        ];
        // Standard completion without structured output
        const response = await model.invoke(messages);
        // Try to extract JSON from the response
        const responseContent = response.content.toString();
        const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/{[\s\S]*?}/);
        if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            try {
                const parsedJSON = JSON.parse(jsonStr);
                // Validate with our schema
                return NodesEdgesType.parse(parsedJSON);
            }
            catch (parseError) {
                console.error('Error parsing JSON from response:', parseError);
                return { error: 'Failed to parse JSON from response', content: responseContent };
            }
        }
        else {
            console.error('No JSON found in response:', responseContent);
            return { error: 'No JSON found in response', content: responseContent };
        }
    }
    catch (error) {
        console.error('Error generating AgentflowV2:', error);
        return { error: error.message || 'Unknown error occurred' };
    }
};
const generateNodesData = (result, config) => {
    try {
        if (result.error) {
            return result;
        }
        let nodes = result.nodes;
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            let nodeName = node.data.name;
            // If nodeName is not found in data.name, try extracting from node.id
            if (!nodeName || !config.componentNodes[nodeName]) {
                nodeName = node.id.split('_')[0];
            }
            const componentNode = config.componentNodes[nodeName];
            if (!componentNode) {
                continue;
            }
            const initializedNodeData = initNode((0, lodash_1.cloneDeep)(componentNode), node.id);
            nodes[i].data = {
                ...initializedNodeData,
                label: node.data?.label
            };
            if (nodes[i].data.name === 'iterationAgentflow') {
                nodes[i].type = 'iteration';
            }
            if (nodes[i].parentNode) {
                nodes[i].extent = 'parent';
            }
        }
        return { nodes, edges: result.edges };
    }
    catch (error) {
        console.error('Error generating AgentflowV2:', error);
        return { error: error.message || 'Unknown error occurred' };
    }
};
const initNode = (nodeData, newNodeId) => {
    const inputParams = [];
    const incoming = nodeData.inputs ? nodeData.inputs.length : 0;
    // Inputs
    for (let i = 0; i < incoming; i += 1) {
        const newInput = {
            ...nodeData.inputs[i],
            id: `${newNodeId}-input-${nodeData.inputs[i].name}-${nodeData.inputs[i].type}`
        };
        inputParams.push(newInput);
    }
    // Credential
    if (nodeData.credential) {
        const newInput = {
            ...nodeData.credential,
            id: `${newNodeId}-input-${nodeData.credential.name}-${nodeData.credential.type}`
        };
        inputParams.unshift(newInput);
    }
    // Outputs
    let outputAnchors = initializeOutputAnchors(nodeData, newNodeId);
    /* Initial
    inputs = [
        {
            label: 'field_label_1',
            name: 'string'
        },
        {
            label: 'field_label_2',
            name: 'CustomType'
        }
    ]

    =>  Convert to inputs, inputParams, inputAnchors

    =>  inputs = { 'field': 'defaultvalue' } // Turn into inputs object with default values
    
    =>  // For inputs that are part of whitelistTypes
        inputParams = [
            {
                label: 'field_label_1',
                name: 'string'
            }
        ]

    =>  // For inputs that are not part of whitelistTypes
        inputAnchors = [
            {
                label: 'field_label_2',
                name: 'CustomType'
            }
        ]
    */
    // Inputs
    if (nodeData.inputs) {
        const defaultInputs = initializeDefaultNodeData(nodeData.inputs);
        nodeData.inputAnchors = showHideInputAnchors({ ...nodeData, inputAnchors: [], inputs: defaultInputs });
        nodeData.inputParams = showHideInputParams({ ...nodeData, inputParams, inputs: defaultInputs });
        nodeData.inputs = defaultInputs;
    }
    else {
        nodeData.inputAnchors = [];
        nodeData.inputParams = [];
        nodeData.inputs = {};
    }
    // Outputs
    if (nodeData.outputs) {
        nodeData.outputs = initializeDefaultNodeData(outputAnchors);
    }
    else {
        nodeData.outputs = {};
    }
    nodeData.outputAnchors = outputAnchors;
    // Credential
    if (nodeData.credential)
        nodeData.credential = '';
    nodeData.id = newNodeId;
    return nodeData;
};
const initializeDefaultNodeData = (nodeParams) => {
    const initialValues = {};
    for (let i = 0; i < nodeParams.length; i += 1) {
        const input = nodeParams[i];
        initialValues[input.name] = input.default || '';
    }
    return initialValues;
};
const createAgentFlowOutputs = (nodeData, newNodeId) => {
    if (nodeData.hideOutput)
        return [];
    if (nodeData.outputs?.length) {
        return nodeData.outputs.map((_, index) => ({
            id: `${newNodeId}-output-${index}`,
            label: nodeData.label,
            name: nodeData.name
        }));
    }
    return [
        {
            id: `${newNodeId}-output-${nodeData.name}`,
            label: nodeData.label,
            name: nodeData.name
        }
    ];
};
const initializeOutputAnchors = (nodeData, newNodeId) => {
    return createAgentFlowOutputs(nodeData, newNodeId);
};
const _showHideOperation = (nodeData, inputParam, displayType, index) => {
    const displayOptions = inputParam[displayType];
    /* For example:
    show: {
        enableMemory: true
    }
    */
    Object.keys(displayOptions).forEach((path) => {
        const comparisonValue = displayOptions[path];
        if (path.includes('$index') && index) {
            path = path.replace('$index', index.toString());
        }
        let groundValue = (0, lodash_1.get)(nodeData.inputs, path, '');
        if (groundValue && typeof groundValue === 'string' && groundValue.startsWith('[') && groundValue.endsWith(']')) {
            groundValue = JSON.parse(groundValue);
        }
        // Handle case where groundValue is an array
        if (Array.isArray(groundValue)) {
            if (Array.isArray(comparisonValue)) {
                // Both are arrays - check if there's any intersection
                const hasIntersection = comparisonValue.some((val) => groundValue.includes(val));
                if (displayType === 'show' && !hasIntersection) {
                    inputParam.display = false;
                }
                if (displayType === 'hide' && hasIntersection) {
                    inputParam.display = false;
                }
            }
            else if (typeof comparisonValue === 'string') {
                // comparisonValue is string, groundValue is array - check if array contains the string
                const matchFound = groundValue.some((val) => comparisonValue === val || new RegExp(comparisonValue).test(val));
                if (displayType === 'show' && !matchFound) {
                    inputParam.display = false;
                }
                if (displayType === 'hide' && matchFound) {
                    inputParam.display = false;
                }
            }
            else if (typeof comparisonValue === 'boolean' || typeof comparisonValue === 'number') {
                // For boolean/number comparison with array, check if array contains the value
                const matchFound = groundValue.includes(comparisonValue);
                if (displayType === 'show' && !matchFound) {
                    inputParam.display = false;
                }
                if (displayType === 'hide' && matchFound) {
                    inputParam.display = false;
                }
            }
            else if (typeof comparisonValue === 'object') {
                // For object comparison with array, use deep equality check
                const matchFound = groundValue.some((val) => (0, lodash_1.isEqual)(comparisonValue, val));
                if (displayType === 'show' && !matchFound) {
                    inputParam.display = false;
                }
                if (displayType === 'hide' && matchFound) {
                    inputParam.display = false;
                }
            }
        }
        else {
            // Original logic for non-array groundValue
            if (Array.isArray(comparisonValue)) {
                if (displayType === 'show' && !comparisonValue.includes(groundValue)) {
                    inputParam.display = false;
                }
                if (displayType === 'hide' && comparisonValue.includes(groundValue)) {
                    inputParam.display = false;
                }
            }
            else if (typeof comparisonValue === 'string') {
                if (displayType === 'show' && !(comparisonValue === groundValue || new RegExp(comparisonValue).test(groundValue))) {
                    inputParam.display = false;
                }
                if (displayType === 'hide' && (comparisonValue === groundValue || new RegExp(comparisonValue).test(groundValue))) {
                    inputParam.display = false;
                }
            }
            else if (typeof comparisonValue === 'boolean') {
                if (displayType === 'show' && comparisonValue !== groundValue) {
                    inputParam.display = false;
                }
                if (displayType === 'hide' && comparisonValue === groundValue) {
                    inputParam.display = false;
                }
            }
            else if (typeof comparisonValue === 'object') {
                if (displayType === 'show' && !(0, lodash_1.isEqual)(comparisonValue, groundValue)) {
                    inputParam.display = false;
                }
                if (displayType === 'hide' && (0, lodash_1.isEqual)(comparisonValue, groundValue)) {
                    inputParam.display = false;
                }
            }
            else if (typeof comparisonValue === 'number') {
                if (displayType === 'show' && comparisonValue !== groundValue) {
                    inputParam.display = false;
                }
                if (displayType === 'hide' && comparisonValue === groundValue) {
                    inputParam.display = false;
                }
            }
        }
    });
};
const showHideInputs = (nodeData, inputType, overrideParams, arrayIndex) => {
    const params = overrideParams ?? nodeData[inputType] ?? [];
    for (let i = 0; i < params.length; i += 1) {
        const inputParam = params[i];
        // Reset display flag to false for each inputParam
        inputParam.display = true;
        if (inputParam.show) {
            _showHideOperation(nodeData, inputParam, 'show', arrayIndex);
        }
        if (inputParam.hide) {
            _showHideOperation(nodeData, inputParam, 'hide', arrayIndex);
        }
    }
    return params;
};
const showHideInputParams = (nodeData) => {
    return showHideInputs(nodeData, 'inputParams');
};
const showHideInputAnchors = (nodeData) => {
    return showHideInputs(nodeData, 'inputAnchors');
};
//# sourceMappingURL=agentflowv2Generator.js.map