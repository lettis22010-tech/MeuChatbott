"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xai_1 = require("@langchain/xai");
const utils_1 = require("../../../src/utils");
class ChatXAI_ChatModels {
    constructor() {
        this.label = 'ChatXAI';
        this.name = 'chatXAI';
        this.version = 1.0;
        this.type = 'ChatXAI';
        this.icon = 'xai.png';
        this.category = 'Chat Models';
        this.description = 'Wrapper around Grok from XAI';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(xai_1.ChatXAI)];
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['xaiApi']
        };
        this.inputs = [
            {
                label: 'Cache',
                name: 'cache',
                type: 'BaseCache',
                optional: true
            },
            {
                label: 'Model',
                name: 'modelName',
                type: 'string',
                placeholder: 'grok-beta'
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
                name: 'maxTokens',
                type: 'number',
                step: 1,
                optional: true,
                additionalParams: true
            },
            {
                label: 'Max Tokens',
                name: 'maxTokens',
                type: 'number',
                step: 1,
                optional: true,
                additionalParams: true
            }
        ];
    }
    async init(nodeData, _, options) {
        const cache = nodeData.inputs?.cache;
        const temperature = nodeData.inputs?.temperature;
        const modelName = nodeData.inputs?.modelName;
        const maxTokens = nodeData.inputs?.maxTokens;
        const streaming = nodeData.inputs?.streaming;
        const credentialData = await (0, utils_1.getCredentialData)(nodeData.credential ?? '', options);
        const xaiApiKey = (0, utils_1.getCredentialParam)('xaiApiKey', credentialData, nodeData);
        const obj = {
            apiKey: xaiApiKey,
            streaming: streaming ?? true,
            model: modelName,
            temperature: temperature ? parseFloat(temperature) : undefined
        };
        if (cache)
            obj.cache = cache;
        if (maxTokens)
            obj.maxTokens = parseInt(maxTokens, 10);
        const model = new xai_1.ChatXAI(obj);
        return model;
    }
}
module.exports = { nodeClass: ChatXAI_ChatModels };
//# sourceMappingURL=ChatXAI.js.map