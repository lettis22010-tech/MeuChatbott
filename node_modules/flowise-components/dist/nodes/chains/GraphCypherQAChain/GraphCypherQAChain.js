"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cypher_1 = require("@langchain/community/chains/graph_qa/cypher");
const utils_1 = require("../../../src/utils");
const prompts_1 = require("@langchain/core/prompts");
const handler_1 = require("../../../src/handler");
const console_1 = require("@langchain/core/tracers/console");
const Moderation_1 = require("../../moderation/Moderation");
const OutputParserHelpers_1 = require("../../outputparsers/OutputParserHelpers");
class GraphCypherQA_Chain {
    constructor(fields) {
        this.label = 'Graph Cypher QA Chain';
        this.name = 'graphCypherQAChain';
        this.version = 1.1;
        this.type = 'GraphCypherQAChain';
        this.icon = 'graphqa.svg';
        this.category = 'Chains';
        this.description = 'Advanced chain for question-answering against a Neo4j graph by generating Cypher statements';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(cypher_1.GraphCypherQAChain)];
        this.sessionId = fields?.sessionId;
        this.inputs = [
            {
                label: 'Language Model',
                name: 'model',
                type: 'BaseLanguageModel',
                description: 'Model for generating Cypher queries and answers.'
            },
            {
                label: 'Neo4j Graph',
                name: 'graph',
                type: 'Neo4j'
            },
            {
                label: 'Cypher Generation Prompt',
                name: 'cypherPrompt',
                optional: true,
                type: 'BasePromptTemplate',
                description: 'Prompt template for generating Cypher queries. Must include {schema} and {question} variables. If not provided, default prompt will be used.'
            },
            {
                label: 'Cypher Generation Model',
                name: 'cypherModel',
                optional: true,
                type: 'BaseLanguageModel',
                description: 'Model for generating Cypher queries. If not provided, the main model will be used.'
            },
            {
                label: 'QA Prompt',
                name: 'qaPrompt',
                optional: true,
                type: 'BasePromptTemplate',
                description: 'Prompt template for generating answers. Must include {context} and {question} variables. If not provided, default prompt will be used.'
            },
            {
                label: 'QA Model',
                name: 'qaModel',
                optional: true,
                type: 'BaseLanguageModel',
                description: 'Model for generating answers. If not provided, the main model will be used.'
            },
            {
                label: 'Input Moderation',
                description: 'Detect text that could generate harmful output and prevent it from being sent to the language model',
                name: 'inputModeration',
                type: 'Moderation',
                optional: true,
                list: true
            },
            {
                label: 'Return Direct',
                name: 'returnDirect',
                type: 'boolean',
                default: false,
                optional: true,
                description: 'If true, return the raw query results instead of using the QA chain'
            }
        ];
        this.outputs = [
            {
                label: 'Graph Cypher QA Chain',
                name: 'graphCypherQAChain',
                baseClasses: [this.type, ...(0, utils_1.getBaseClasses)(cypher_1.GraphCypherQAChain)]
            },
            {
                label: 'Output Prediction',
                name: 'outputPrediction',
                baseClasses: ['string', 'json']
            }
        ];
    }
    async init(nodeData, input, options) {
        const model = nodeData.inputs?.model;
        const cypherModel = nodeData.inputs?.cypherModel;
        const qaModel = nodeData.inputs?.qaModel;
        const graph = nodeData.inputs?.graph;
        const cypherPrompt = nodeData.inputs?.cypherPrompt;
        const qaPrompt = nodeData.inputs?.qaPrompt;
        const returnDirect = nodeData.inputs?.returnDirect;
        const output = nodeData.outputs?.output;
        if (!model) {
            throw new Error('Language Model is required');
        }
        // Handle prompt values if they exist
        let cypherPromptTemplate;
        let qaPromptTemplate;
        if (cypherPrompt) {
            if (cypherPrompt instanceof prompts_1.PromptTemplate) {
                cypherPromptTemplate = new prompts_1.PromptTemplate({
                    template: cypherPrompt.template,
                    inputVariables: cypherPrompt.inputVariables
                });
                if (!qaPrompt) {
                    throw new Error('QA Prompt is required when Cypher Prompt is a Prompt Template');
                }
            }
            else if (cypherPrompt instanceof prompts_1.FewShotPromptTemplate) {
                const examplePrompt = cypherPrompt.examplePrompt;
                cypherPromptTemplate = new prompts_1.FewShotPromptTemplate({
                    examples: cypherPrompt.examples,
                    examplePrompt: examplePrompt,
                    inputVariables: cypherPrompt.inputVariables,
                    prefix: cypherPrompt.prefix,
                    suffix: cypherPrompt.suffix,
                    exampleSeparator: cypherPrompt.exampleSeparator,
                    templateFormat: cypherPrompt.templateFormat
                });
            }
            else {
                cypherPromptTemplate = cypherPrompt;
            }
        }
        if (qaPrompt instanceof prompts_1.PromptTemplate) {
            qaPromptTemplate = new prompts_1.PromptTemplate({
                template: qaPrompt.template,
                inputVariables: qaPrompt.inputVariables
            });
        }
        // Validate required variables in prompts
        if (cypherPromptTemplate &&
            (!cypherPromptTemplate?.inputVariables.includes('schema') || !cypherPromptTemplate?.inputVariables.includes('question'))) {
            throw new Error('Cypher Generation Prompt must include {schema} and {question} variables');
        }
        const fromLLMInput = {
            llm: model,
            graph,
            returnDirect
        };
        if (cypherPromptTemplate) {
            fromLLMInput['cypherLLM'] = cypherModel ?? model;
            fromLLMInput['cypherPrompt'] = cypherPromptTemplate;
        }
        if (qaPromptTemplate) {
            fromLLMInput['qaLLM'] = qaModel ?? model;
            fromLLMInput['qaPrompt'] = qaPromptTemplate;
        }
        const chain = cypher_1.GraphCypherQAChain.fromLLM(fromLLMInput);
        if (output === this.name) {
            return chain;
        }
        else if (output === 'outputPrediction') {
            nodeData.instance = chain;
            return await this.run(nodeData, input, options);
        }
        return chain;
    }
    async run(nodeData, input, options) {
        const chain = nodeData.instance;
        const moderations = nodeData.inputs?.inputModeration;
        const returnDirect = nodeData.inputs?.returnDirect;
        const shouldStreamResponse = options.shouldStreamResponse;
        const sseStreamer = options.sseStreamer;
        const chatId = options.chatId;
        // Handle input moderation if configured
        if (moderations && moderations.length > 0) {
            try {
                input = await (0, Moderation_1.checkInputs)(moderations, input);
            }
            catch (e) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                if (shouldStreamResponse) {
                    (0, Moderation_1.streamResponse)(sseStreamer, chatId, e.message);
                }
                return (0, OutputParserHelpers_1.formatResponse)(e.message);
            }
        }
        const obj = {
            query: input
        };
        const loggerHandler = new handler_1.ConsoleCallbackHandler(options.logger, options?.orgId);
        const callbackHandlers = await (0, handler_1.additionalCallbacks)(nodeData, options);
        let callbacks = [loggerHandler, ...callbackHandlers];
        if (process.env.DEBUG === 'true') {
            callbacks.push(new console_1.ConsoleCallbackHandler());
        }
        try {
            let response;
            if (shouldStreamResponse) {
                if (returnDirect) {
                    response = await chain.invoke(obj, { callbacks });
                    let result = response?.result;
                    if (typeof result === 'object') {
                        result = '```json\n' + JSON.stringify(result, null, 2);
                    }
                    if (result && typeof result === 'string') {
                        (0, Moderation_1.streamResponse)(sseStreamer, chatId, result);
                    }
                }
                else {
                    const handler = new handler_1.CustomChainHandler(sseStreamer, chatId, 2);
                    callbacks.push(handler);
                    response = await chain.invoke(obj, { callbacks });
                }
            }
            else {
                response = await chain.invoke(obj, { callbacks });
            }
            return (0, OutputParserHelpers_1.formatResponse)(response?.result);
        }
        catch (error) {
            console.error('Error in GraphCypherQAChain:', error);
            if (shouldStreamResponse) {
                (0, Moderation_1.streamResponse)(sseStreamer, chatId, error.message);
            }
            return (0, OutputParserHelpers_1.formatResponse)(`Error: ${error.message}`);
        }
    }
}
module.exports = { nodeClass: GraphCypherQA_Chain };
//# sourceMappingURL=GraphCypherQAChain.js.map