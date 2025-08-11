import { DynamicStructuredTool } from '../OpenAPIToolkit/core';
export declare const desc = "Use this when you want to access Jira API for managing issues, comments, and users";
export interface Headers {
    [key: string]: string;
}
export interface Body {
    [key: string]: any;
}
export interface RequestParameters {
    headers?: Headers;
    body?: Body;
    url?: string;
    description?: string;
    maxOutputLength?: number;
    name?: string;
    actions?: string[];
    username?: string;
    accessToken?: string;
    jiraHost?: string;
    defaultParams?: any;
}
export declare const createJiraTools: (args?: RequestParameters) => DynamicStructuredTool[];
