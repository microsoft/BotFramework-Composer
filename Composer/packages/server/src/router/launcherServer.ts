import express, { Router } from 'express';
import fs from 'fs';
import path from 'path';
import config from '../config';
import {ConnectorFactory} from '../launcher-connectors/connectorFactory';
import {LauncherStatus} from '../launcher-connectors/interface';

 export class launcherServer{
    public router = express.Router({});

    constructor(){
        const botconfig = config.botconfig;
        var connector = new ConnectorFactory().CreateConnector(botconfig.launcherConnector);
        this.router.get("/start", function(req: any, res: any, next: any) {
            try {
                 if (connector.status == LauncherStatus.Running) {
                     throw new Error("Already running");
                 }
        
                 connector.start();
                 res.send('OK');
            } catch (error) {
                res.status(400).json({error:'Start error'});
            }
        });
        
        this.router.get("/stop", function(req: any, res: any, next: any) {
            try {
                if (connector.status == LauncherStatus.Stopped) {
                    throw new Error("Already stopped");
                }
        
                connector.stop();
                res.send('OK');
            } catch (error) {
                res.status(400).json({error: 'Stop error'});
            }
        });
        
        this.router.get("/status", function(req: any, res: any, next: any) {
            res.send(connector.status == LauncherStatus.Running ? "Running":"Stopped");
        })
    }
    
    public getRouter(){
        return this.router;
    }
}


