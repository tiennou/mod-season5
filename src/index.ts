import { ServerConfig } from "typed-screeps-server";

declare module "typed-screeps-server" {
  interface ServerConfig {
    assetsUrl: string;
  }
}

export default function (config: ServerConfig) {
    if (config.backend && config.backend.features) {
        config.backend.features.push({ name: 'season5', version: 1, resourceTypeNames: { T: 'thorium' } })
    }

    config.assetsUrl = 'https://s3.amazonaws.com/static.screeps.com/season5/';

    try{
        require('./official-specific')(config);
    } catch {}

    require('./thorium')(config);

    require('./mineral.roomObject')(config);
    require('./mineral.renderer')(config);

    require('./reactor.roomObject')(config);
    require('./reactor.renderer')(config);

    require('./creep.claimReactor')(config);

    require('./terminal-restriction')(config);
    require('./stronghold-rewards')(config);

    require('./decorations')(config);
    require('./scoreboard')(config);
};
