"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../../src/utils");
const core_1 = require("../core");
class Github_MCP {
    constructor() {
        //@ts-ignore
        this.loadMethods = {
            listActions: async (nodeData, options) => {
                try {
                    const toolset = await this.getTools(nodeData, options);
                    toolset.sort((a, b) => a.name.localeCompare(b.name));
                    return toolset.map(({ name, ...rest }) => ({
                        label: name.toUpperCase(),
                        name: name,
                        description: rest.description || name
                    }));
                }
                catch (error) {
                    console.error('Error listing actions:', error);
                    return [
                        {
                            label: 'No Available Actions',
                            name: 'error',
                            description: 'No available actions, please check your Github Access Token and refresh'
                        }
                    ];
                }
            }
        };
        this.label = 'Github MCP';
        this.name = 'githubMCP';
        this.version = 1.0;
        this.type = 'Github MCP Tool';
        this.icon = 'github.svg';
        this.category = 'Tools (MCP)';
        this.description = 'MCP Server for the GitHub API';
        this.documentation = 'https://github.com/modelcontextprotocol/servers/tree/main/src/github';
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['githubApi']
        };
        this.inputs = [
            {
                label: 'Available Actions',
                name: 'mcpActions',
                type: 'asyncMultiOptions',
                loadMethod: 'listActions',
                refresh: true
            }
        ];
        this.baseClasses = ['Tool'];
    }
    async init(nodeData, _, options) {
        const tools = await this.getTools(nodeData, options);
        const _mcpActions = nodeData.inputs?.mcpActions;
        let mcpActions = [];
        if (_mcpActions) {
            try {
                mcpActions = typeof _mcpActions === 'string' ? JSON.parse(_mcpActions) : _mcpActions;
            }
            catch (error) {
                console.error('Error parsing mcp actions:', error);
            }
        }
        return tools.filter((tool) => mcpActions.includes(tool.name));
    }
    async getTools(nodeData, options) {
        const credentialData = await (0, utils_1.getCredentialData)(nodeData.credential ?? '', options);
        const accessToken = (0, utils_1.getCredentialParam)('accessToken', credentialData, nodeData);
        if (!accessToken) {
            throw new Error('Missing Github Access Token');
        }
        const packagePath = (0, utils_1.getNodeModulesPackagePath)('@modelcontextprotocol/server-github/dist/index.js');
        const serverParams = {
            command: 'node',
            args: [packagePath],
            env: {
                GITHUB_PERSONAL_ACCESS_TOKEN: accessToken
            }
        };
        const toolkit = new core_1.MCPToolkit(serverParams, 'stdio');
        await toolkit.initialize();
        const tools = toolkit.tools ?? [];
        return tools;
    }
}
module.exports = { nodeClass: Github_MCP };
//# sourceMappingURL=GithubMCP.js.map