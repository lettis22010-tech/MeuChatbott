"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fireworks_1 = require("@langchain/community/chat_models/fireworks");
const utils_1 = require("../../../src/utils");
class ChatFireworks_ChatModels {
    constructor() {
        this.label = 'ChatFireworks';
        this.name = 'chatFireworks';
        this.version = 2.0;
        this.type = 'ChatFireworks';
        this.icon = 'Fireworks.png';
        this.category = 'Chat Models';
        this.description = 'Wrapper around Fireworks Chat Endpoints';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(fireworks_1.ChatFireworks)];
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['fireworksApi']
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
                default: 'accounts/fireworks/models/llama-v2-13b-chat',
                placeholder: 'accounts/fireworks/models/llama-v2-13b-chat'
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
                optional: true
            }
        ];
    }
    async init(nodeData, _, options) {
        const cache = nodeData.inputs?.cache;
        const temperature = nodeData.inputs?.temperature;
        const modelName = nodeData.inputs?.modelName;
        const streaming = nodeData.inputs?.streaming;
        const credentialData = await (0, utils_1.getCredentialData)(nodeData.credential ?? '', options);
        const fireworksApiKey = (0, utils_1.getCredentialParam)('fireworksApiKey', credentialData, nodeData);
        const obj = {
            fireworksApiKey,
            model: modelName,
            modelName,
            temperature: temperature ? parseFloat(temperature) : undefined,
            streaming: streaming ?? true
        };
        if (cache)
            obj.cache = cache;
        const model = new fireworks_1.ChatFireworks(obj);
        return model;
    }
}
module.exports = { nodeClass: ChatFireworks_ChatModels };
//# sourceMappingURL=ChatFireworks.js.map