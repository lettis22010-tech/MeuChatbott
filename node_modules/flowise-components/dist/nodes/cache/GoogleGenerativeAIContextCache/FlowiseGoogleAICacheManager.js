"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAICacheManager = void 0;
const server_1 = require("@google/generative-ai/server");
const object_hash_1 = __importDefault(require("object-hash"));
class GoogleAICacheManager extends server_1.GoogleAICacheManager {
    constructor() {
        super(...arguments);
        this.cachedContents = new Map();
    }
    setTtlSeconds(ttlSeconds) {
        this.ttlSeconds = ttlSeconds;
    }
    async lookup(options) {
        const { model, tools, contents } = options;
        if (!contents?.length) {
            return undefined;
        }
        const hashKey = (0, object_hash_1.default)({
            model,
            tools,
            contents
        });
        if (this.cachedContents.has(hashKey)) {
            return this.cachedContents.get(hashKey);
        }
        const { cachedContents } = await this.list();
        const cachedContent = (cachedContents ?? []).find((cache) => cache.displayName === hashKey);
        if (cachedContent) {
            this.cachedContents.set(hashKey, cachedContent);
            return cachedContent;
        }
        const res = await this.create({
            ...options,
            displayName: hashKey,
            ttlSeconds: this.ttlSeconds
        });
        this.cachedContents.set(hashKey, res);
        return res;
    }
}
exports.GoogleAICacheManager = GoogleAICacheManager;
exports.default = GoogleAICacheManager;
//# sourceMappingURL=FlowiseGoogleAICacheManager.js.map