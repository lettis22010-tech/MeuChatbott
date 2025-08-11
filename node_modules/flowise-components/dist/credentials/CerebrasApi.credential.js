"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CerebrasAPIAuth {
    constructor() {
        this.label = 'Cerebras API Key';
        this.name = 'cerebrasAIApi';
        this.version = 1.0;
        this.inputs = [
            {
                label: 'Cerebras API Key',
                name: 'cerebrasApiKey',
                type: 'password',
                description: 'API Key (cloud.cerebras.ai)'
            }
        ];
    }
}
module.exports = { credClass: CerebrasAPIAuth };
//# sourceMappingURL=CerebrasApi.credential.js.map