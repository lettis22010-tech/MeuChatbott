import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import { IChatFlow, chatType, IChatMessage } from './Interface';
import { NodesPool } from './NodesPool';
import { ChatFlow } from './database/entities/ChatFlow';
import { ChatMessage } from './database/entities/ChatMessage';
import { ChatflowPool } from './ChatflowPool';
import { CachePool } from './CachePool';
import { Telemetry } from './utils/telemetry';
export declare class App {
    app: express.Application;
    nodesPool: NodesPool;
    chatflowPool: ChatflowPool;
    cachePool: CachePool;
    telemetry: Telemetry;
    AppDataSource: import("typeorm").DataSource;
    constructor();
    initDatabase(): Promise<void>;
    config(socketIO?: Server): Promise<void>;
    /**
     * Validate API Key
     * @param {Request} req
     * @param {Response} res
     * @param {ChatFlow} chatflow
     */
    validateKey(req: Request, chatflow: ChatFlow): Promise<boolean>;
    /**
     * Method that checks if uploads are enabled in the chatflow
     * @param {string} chatflowid
     */
    getUploadsConfig(chatflowid: string): Promise<any>;
    /**
     * Method that get chat messages.
     * @param {string} chatflowid
     * @param {chatType} chatType
     * @param {string} sortOrder
     * @param {string} chatId
     * @param {string} memoryType
     * @param {string} sessionId
     * @param {string} startDate
     * @param {string} endDate
     */
    getChatMessage(chatflowid: string, chatType: chatType | undefined, sortOrder?: string, chatId?: string, memoryType?: string, sessionId?: string, startDate?: string, endDate?: string, messageId?: string): Promise<ChatMessage[]>;
    /**
     * Method that add chat messages.
     * @param {Partial<IChatMessage>} chatMessage
     */
    addChatMessage(chatMessage: Partial<IChatMessage>): Promise<ChatMessage>;
    upsertVector(req: Request, res: Response, isInternal?: boolean): Promise<express.Response<any, Record<string, any>>>;
    /**
     * Build Chatflow
     * @param {Request} req
     * @param {Response} res
     * @param {Server} socketIO
     * @param {boolean} isInternal
     * @param {boolean} isUpsert
     */
    buildChatflow(req: Request, res: Response, socketIO?: Server, isInternal?: boolean): Promise<express.Response<any, Record<string, any>>>;
    stopApp(): Promise<void>;
}
export declare function getAllChatFlow(): Promise<IChatFlow[]>;
export declare function start(): Promise<void>;
export declare function getInstance(): App | undefined;
