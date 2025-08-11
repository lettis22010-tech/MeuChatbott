"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baidu_qianfan_1 = require("@langchain/baidu-qianfan");
const utils_1 = require("../../../src/utils");
class ChatBaiduWenxin_ChatModels {
    constructor() {
        this.label = 'ChatBaiduWenxin';
        this.name = 'chatBaiduWenxin';
        this.version = 2.0;
        this.type = 'ChatBaiduWenxin';
        this.icon = 'baiduwenxin.svg';
        this.category = 'Chat Models';
        this.description = 'Wrapper around BaiduWenxin Chat Endpoints';
        this.baseClasses = [this.type, ...(0, utils_1.getBaseClasses)(baidu_qianfan_1.ChatBaiduQianfan)];
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['baiduQianfanApi']
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
                placeholder: 'ERNIE-Bot-turbo'
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
        const qianfanAccessKey = (0, utils_1.getCredentialParam)('qianfanAccessKey', credentialData, nodeData);
        const qianfanSecretKey = (0, utils_1.getCredentialParam)('qianfanSecretKey', credentialData, nodeData);
        const obj = {
            streaming: streaming ?? true,
            qianfanAccessKey,
            qianfanSecretKey,
            modelName,
            temperature: temperature ? parseFloat(temperature) : undefined
        };
        if (cache)
            obj.cache = cache;
        const model = new baidu_qianfan_1.ChatBaiduQianfan(obj);
        return model;
    }
}
module.exports = { nodeClass: ChatBaiduWenxin_ChatModels };
//# sourceMappingURL=ChatBaiduWenxin.js.map