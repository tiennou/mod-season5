import { ServerConfig } from "typed-screeps-server";
import path from 'path';

import thorium from './thorium';
import mineralRoomObject from './mineral.roomObject';
import mineralRenderer from './mineral.renderer';
import reactorRoomObject from './reactor.roomObject';
import reactorRenderer from './reactor.renderer';
import creepClaimReactor from './creep.claimReactor';
import terminalRestriction from './terminal-restriction';
import strongholdRewards from './stronghold-rewards';
import decorations from './decorations';
import scoreboard from './scoreboard';

declare module "typed-screeps-server" {
    interface ServerConfig {
        assetsUrl: string;
    }
}

export = function (config: ServerConfig) {
    config.assetsUrl = '{ASSETS_URL}season5/';
    
    if (config.backend) {
        config.backend.features ??= []
        config.backend.features.push({ name: 'season5', version: 1, resourceTypeNames: { T: 'thorium' } })
        
        config.backend.on('expressPreConfig', (app) => {
            const express = require.main!.require('express') as typeof import('express');
            const assetsDir = path.join(__dirname, '..', 'assets');
            app.use('/assets/season5', (_req, res, next) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                next();
            }, express.static(assetsDir));
        });
    }
    
    try {
        require('./official-specific')(config);
    } catch {}
    
    thorium(config);
    
    mineralRoomObject(config);
    mineralRenderer(config);
    
    reactorRoomObject(config);
    reactorRenderer(config);
    
    creepClaimReactor(config);
    
    terminalRestriction(config);
    strongholdRewards(config);
    
    decorations(config);
    scoreboard(config);
};
