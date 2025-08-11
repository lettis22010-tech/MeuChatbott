"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../../src");
const FlowiseGoogleAICacheManager_1 = __importDefault(require("./FlowiseGoogleAICacheManager"));
class GoogleGenerativeAIContextCache {
    constructor() {
        this.label = 'Google GenAI Context Cache';
        this.name = 'googleGenerativeAIContextCache';
        this.version = 1.0;
        this.type = 'GoogleAICacheManager';
        this.description = 'Large context cache for Google Gemini large language models';
        this.icon = 'GoogleGemini.svg';
        this.category = 'Cache';
        this.baseClasses = [this.type, ...(0, src_1.getBaseClasses)(FlowiseGoogleAICacheManager_1.default)];
        this.inputs = [
            {
                label: 'TTL',
                name: 'ttl',
                type: 'number',
                default: 60 * 60 * 24 * 30
            }
        ];
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['googleGenerativeAI'],
            optional: false,
            description: 'Google Generative AI credential.'
        };
    }
    async init(nodeData, _, options) {
        const ttl = nodeData.inputs?.ttl;
        const credentialData = await (0, src_1.getCredentialData)(nodeData.credential ?? '', options);
        const apiKey = (0, src_1.getCredentialParam)('googleGenerativeAPIKey', credentialData, nodeData);
        const manager = new FlowiseGoogleAICacheManager_1.default(apiKey);
        manager.setTtlSeconds(ttl);
        return manager;
    }
}
module.exports = { nodeClass: GoogleGenerativeAIContextCache };
//# sourceMappingURL=GoogleGenerativeAIContextCache.js.map