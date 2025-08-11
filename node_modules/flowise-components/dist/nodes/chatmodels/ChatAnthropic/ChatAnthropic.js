"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const anthropic_1 = require("@langchain/anthropic");
const utils_1 = require("../../../src/utils");
const FlowiseChatAnthropic_1 = require("./FlowiseChatAnthropic");
const modelLoader_1 = require("../../../src/modelLoader");
class ChatAnthropic_ChatModels {
    constructor() {
        //@ts-ignore
        this.loadMethods = {
            async listModels() {
                return await (0, modelLoader_1.getModels)(modelLoader_1.MODEL_TYPE.CHAT, 'chatAnthropic');
            }
        };
        this.label = 'ChatAnthropic';
        this.name = 'chatAnthropic';
        this.version = 8.0;
        this.type = 'ChatAnthropic';
        this.icon = 'Anthropic.svg';
        this.category = 'Chat Models';
        this.description = 'Wrapper around ChatAnthropic large language models that use the Chat endpoint';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(anthropic_1.ChatAnthropic)];
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['anthropicApi']
        };
        this.inputs = [
            {
                label: 'Cache',
                name: 'cache',
                type: 'BaseCache',
                optional: true
            },
            {
                label: 'Model Name',
                name: 'modelName',
                type: 'asyncOptions',
                loadMethod: 'listModels',
                default: 'claude-3-haiku'
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                step: 0.1,
                default: 0.9,
                optional: true
            },
            {
                label: 'Streaming',
                name: 'streaming',
                type: 'boolean',
                default: true,
                optional: true,
                additionalParams: true
            },
            {
                label: 'Max Tokens',
                name: 'maxTokensToSample',
                type: 'number',
                step: 1,
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top P',
                name: 'topP',
                type: 'number',
                step: 0.1,
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top K',
                name: 'topK',
                type: 'number',
                step: 0.1,
                optional: true,
                additionalParams: true
            },
            {
                label: 'Extended Thinking',
                name: 'extendedThinking',
                type: 'boolean',
                description: 'Enable extended thinking for reasoning model such as Claude Sonnet 3.7',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Budget Tokens',
                name: 'budgetTokens',
                type: 'number',
                step: 1,
                default: 1024,
                description: 'Maximum number of tokens Claude is allowed use for its internal reasoning process',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Allow Image Uploads',
                name: 'allowImageUploads',
                type: 'boolean',
                description: 'Allow image input. Refer to the <a href="https://docs.flowiseai.com/using-flowise/uploads#image" target="_blank">docs</a> for more details.',
                default: false,
                optional: true
            }
        ];
    }
    async init(nodeData, _, options) {
        const temperature = nodeData.inputs?.temperature;
        const modelName = nodeData.inputs?.modelName;
        const maxTokens = nodeData.inputs?.maxTokensToSample;
        const topP = nodeData.inputs?.topP;
        const topK = nodeData.inputs?.topK;
        const streaming = nodeData.inputs?.streaming;
        const cache = nodeData.inputs?.cache;
        const extendedThinking = nodeData.inputs?.extendedThinking;
        const budgetTokens = nodeData.inputs?.budgetTokens;
        const credentialData = await (0, utils_1.getCredentialData)(nodeData.credential ?? '', options);
        const anthropicApiKey = (0, utils_1.getCredentialParam)('anthropicApiKey', credentialData, nodeData);
        const allowImageUploads = nodeData.inputs?.allowImageUploads;
        const obj = {
            temperature: parseFloat(temperature),
            modelName,
            anthropicApiKey,
            streaming: streaming ?? true
        };
        if (maxTokens)
            obj.maxTokens = parseInt(maxTokens, 10);
        if (topP)
            obj.topP = parseFloat(topP);
        if (topK)
            obj.topK = parseFloat(topK);
        if (cache)
            obj.cache = cache;
        if (extendedThinking) {
            obj.thinking = {
                type: 'enabled',
                budget_tokens: parseInt(budgetTokens, 10)
            };
            delete obj.temperature;
        }
        const multiModalOption = {
            image: {
                allowImageUploads: allowImageUploads ?? false
            }
        };
        const model = new FlowiseChatAnthropic_1.ChatAnthropic(nodeData.id, obj);
        model.setMultiModalOption(multiModalOption);
        return model;
    }
}
module.exports = { nodeClass: ChatAnthropic_ChatModels };
//# sourceMappingURL=ChatAnthropic.js.map