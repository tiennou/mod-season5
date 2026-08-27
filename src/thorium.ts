import { RawCreep, RawPowerCreep, ServerConfig } from "typed-screeps-server";
import _ from 'lodash';
import { RawReactor } from "./reactor.roomObject";
import { BulkCollection } from "typed-screeps-server/dist/bulk";

declare module "typed-screeps-server" {
    interface MineralResources {
        T: 'T'
    }
}

export default function(config: ServerConfig) {
    if(config.common) {
        config.common.constants.RESOURCE_THORIUM = 'T';
        config.common.constants.RESOURCES_ALL.push(config.common.constants.RESOURCE_THORIUM);
    }

    if(config.engine) {
        config.engine.on('processRoom', function(roomId, roomInfo, roomObjects, roomTerrain, gameTime, bulk, bulkUsers, eventLog) {
            const thoriumByPosition: Record<number, number> = {};

            const objectsWithThorium = Object.values(roomObjects).filter((o) => ("store" in o) && "T" in o.store) as (RawCreep | RawPowerCreep | RawReactor)[];
            for(const object of objectsWithThorium) {
                const key = 50*object.x+object.y;
                thoriumByPosition[key] = thoriumByPosition[key] || 0;
                thoriumByPosition[key] += object.store['T'];
            }

            for(const pos in thoriumByPosition) {
                const position = parseInt(pos, 10);
                const ttlPenalty = Math.log10(thoriumByPosition[position])|0;

                const [x,y] = [(position/50)|0, position % 50];
                const objectsInTile = _.filter(roomObjects, {x, y});

                for(const o of objectsInTile) {
                    if('ageTime' in o) {
                        (bulk as BulkCollection<typeof o>).inc(o._id, 'ageTime', -ttlPenalty);
                        continue;
                    }
                    if('decayTime' in o) {
                        (bulk as BulkCollection<typeof o>).inc(o._id, 'decayTime', -ttlPenalty);
                    }
                    if('nextDecayTime' in o) {
                        (bulk as BulkCollection<typeof o>).inc(o._id, 'nextDecayTime', -ttlPenalty);
                    }
                }
            }
        });
    }
}