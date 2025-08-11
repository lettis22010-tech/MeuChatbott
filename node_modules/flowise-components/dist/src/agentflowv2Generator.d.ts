import { ICommonObject } from './Interface';
interface NodePosition {
    x: number;
    y: number;
}
interface EdgeData {
    edgeLabel?: string;
    sourceColor?: string;
    targetColor?: string;
    isHumanInput?: boolean;
}
interface AgentToolConfig {
    agentSelectedTool: string;
    agentSelectedToolConfig: {
        agentSelectedTool: string;
    };
}
interface NodeInputs {
    agentTools?: AgentToolConfig[];
    toolAgentflowSelectedTool?: string;
    toolInputArgs?: Record<string, any>[];
    toolAgentflowSelectedToolConfig?: {
        toolAgentflowSelectedTool: string;
    };
    [key: string]: any;
}
interface NodeData {
    label?: string;
    name?: string;
    id?: string;
    inputs?: NodeInputs;
    inputAnchors?: InputAnchor[];
    inputParams?: InputParam[];
    outputs?: Record<string, any>;
    outputAnchors?: OutputAnchor[];
    credential?: string;
    color?: string;
    [key: string]: any;
}
interface Node {
    id: string;
    type: 'agentFlow' | 'iteration';
    position: NodePosition;
    width: number;
    height: number;
    selected?: boolean;
    positionAbsolute?: NodePosition;
    data: NodeData;
    parentNode?: string;
    extent?: string;
}
interface Edge {
    id: string;
    type: 'agentFlow';
    source: string;
    sourceHandle: string;
    target: string;
    targetHandle: string;
    data?: EdgeData;
    label?: string;
}
interface InputAnchor {
    id: string;
    label: string;
    name: string;
    type?: string;
    [key: string]: any;
}
interface InputParam {
    id: string;
    name: string;
    label?: string;
    type?: string;
    display?: boolean;
    show?: Record<string, any>;
    hide?: Record<string, any>;
    [key: string]: any;
}
interface OutputAnchor {
    id: string;
    label: string;
    name: string;
}
export declare const generateAgentflowv2: (config: Record<string, any>, question: string, options: ICommonObject) => Promise<{
    nodes: Node[];
    edges: Edge[];
    error?: undefined;
} | {
    error: any;
    nodes?: undefined;
    edges?: undefined;
}>;
export {};
