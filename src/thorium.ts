import { CreepObject, PowerCreepObject, ServerConfig } from "typed-screeps-server";
import _ from 'lodash';
import { ReactorObject } from "./reactor.roomObject";
import { BulkCollection } from "typed-screeps-server/dist/bulk";

export default function(config: ServerConfig) {
    if(config.common) {
        config.common.constants.RESOURCE_THORIUM = 'T';
        config.common.constants.RESOURCES_ALL.push(config.common.constants.RESOURCE_THORIUM);
    }

    if(config.engine) {
        config.engine.on('processRoom', function(roomId, roomInfo, roomObjects, roomTerrain, gameTime, bulk, bulkUsers, eventLog) {
            const thoriumByPosition: Record<number, number> = {};

            const objectsWithThorium = Object.values(roomObjects).filter((o) => ("store" in o) && "T" in o.store) as (CreepObject | PowerCreepObject | ReactorObject)[];
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
                    if(!o._id) {
                        continue;
                    }
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