import { BaseObject, Id, ServerConfig, User } from "typed-screeps-server";
import _ from 'lodash';

export interface ReactorObject extends BaseObject {
    _id?: Id<ReactorObject>;
    type: "reactor";
    store: any;
    launchTime?: number | null;
    user: Id<User>;
}

declare module 'typed-screeps-server' {
    interface RoomObjects {
        ReactorObject: ReactorObject;
    }

    interface User {
        score: number;
        rank: number;
    }
}

export default function(config: ServerConfig) {
    if(config.common) {
        config.common.constants.FIND_REACTORS = 10051;
        config.common.constants.LOOK_REACTORS = "reactor";
    }

    if (config.backend) {
        config.backend.customObjectTypes.reactor = {
            sidepanel: '<div><label class="body-header">Store:</label>' +
                    '<div ng-if="!Room.calcResources(Room.selectedObject)"> Empty </div>' +
                    '<div ng-if="Room.calcResources(Room.selectedObject)">' +
                        '<table ng-repeat="(resourceType, amount) in Room.selectedObject.store" ng-if="amount > 0">' +
                            '<td>{{amount | number}}&nbsp;&times;&nbsp;</td>' +
                            '<td><img class="resource-type" ng-src="https://s3.amazonaws.com/static.screeps.com/upload/mineral-icons/{{resourceType}}.png" uib-tooltip="{{Room.resourceTypeNames[resourceType]}}"></td>' +
                        '</table>' +
                    '</div>' +
                '</div>' +
                '<div ng-if="object.launchTime">' +
                    '<label>Continuous work:</label><span>{{Room.gameTime - object.launchTime}}</span>' +
                '</div>'
        };

        config.backend.on('expressPostConfig', function(app/*, params */) { // XXX: There's actually no `params` here. Server just passes in the Express app.
            // @ts-expect-error
            const utils = params.utils;
            const previousRespawn = utils.respawnUser;
            utils.respawnUser = async function(userId: number) {
                await config.common.storage.db['rooms.objects'].update({type: 'reactor', user: userId.toString()}, {$unset: {user: 1, launchTime: 1}});
                return previousRespawn(userId);
            }
        });
    }

    if(config.engine) {
        config.engine.registerCustomObjectPrototype('reactor', 'Reactor', {
            prototypeExtender (prototype, scope, {utils}) {
                const data = (id: string) => {
                    if (!scope.runtimeData.roomObjects[id]) {
                        throw new Error("Could not find an object with ID " + id);
                    }
                    return scope.runtimeData.roomObjects[id];
                };

                utils.defineGameObjectProperties(prototype, data, {
                    owner: o => o.user ? { username: scope.runtimeData.users[o.user].username } : undefined,
                    my: o => o.user ? o.user == scope.runtimeData.user._id : undefined,
                    store: o => new scope.globals.Store(o),
                    continuousWork: o => o.launchTime ? scope.runtimeData.time - o.launchTime : 0
                });

                prototype.toString = function() { return `[reactor #${this.id}]` };
            },
            findConstant: config.common.constants.FIND_REACTORS,
            lookConstant: config.common.constants.LOOK_REACTORS
        });

        config.engine.on('preProcessObjectIntents', function(object, userId, objectIntents, roomObjects, roomTerrain, gameTime, roomInfo, bulk, bulkUsers){
            if(objectIntents.withdraw && objectIntents.withdraw.id && objectIntents.withdraw.resourceType == config.common.constants.RESOURCE_THORIUM) {
                const target = roomObjects[objectIntents.withdraw.id];
                if(target.type == 'reactor') {
                    objectIntents.withdraw = null;
                }
            }
        });

        config.engine.on('postProcessObject', function (object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, bulkUsers, eventLog, mapView) {
            if (object.type == 'reactor') {
                if(!object.store.T && object.launchTime) {
                    delete object.launchTime;
                    bulk.update(object, {launchTime: null});
                    return;
                }

                if(object.user) {
                    if(object.store.T) {
                        if(!object.launchTime) {
                            object.launchTime = gameTime;
                            bulk.update(object, {launchTime: object.launchTime});
                        }

                        bulk.update(object, {store: {T: object.store.T - 1}});
                        object.store.T--;

                        const score = 1+Math.floor(Math.log10(1+gameTime-object.launchTime));
                        bulkUsers.inc(object.user, 'score', score);
                    }
                }

                roomInfo.active = true;
            }
        });
    }

    if(config.cronjobs) {
        config.cronjobs.genReactors = [60, async ({utils}) => {
            const C = config.common.constants;
            const {db, env} = config.common.storage;

            // run once
            if(await env.get('reactorsGenerated')) {
                return;
            }
            console.log(`Generating reactors...`);

            const common = require('@screeps/common');

            const roomObjects = await db['rooms.objects'].find({}) as BaseObject[];
            const rooms = await db['rooms'].find({_id: {$regex: '5[NS]\\d?5$'}});
            console.log(`${rooms.length} central rooms`);

            for(const room of rooms) {
                const reactor = _.find(roomObjects, {type: 'reactor', room: room._id}) as unknown as ReactorObject;
                if(reactor) {
                    continue;
                }
                console.log(`No reactor in room ${room._id}`);
                const wallObjects = _.filter(roomObjects,
                    o => o.room == room._id && _.includes(['source', 'mineral', 'controller'], o.type));
                const roomTerrain = await db['rooms.terrain'].findOne({room: room._id});
                const terrain = roomTerrain.terrain;

                const freePos = await utils.findFreePos(room._id, 0);
                if(!freePos) {
                    console.log(`No free position for reactor in ${room._id}`);
                    return;
                }

                await db['rooms.objects'].insert({
                    room: room._id,
                    x: freePos.x,
                    y: freePos.y,
                    type: 'reactor',
                    store: {},
                    storeCapacityResource: {T: 1000}
                });
                console.log(`${room._id}: ${freePos.x},${freePos.y}`);
            }

            await env.set('reactorsGenerated', 1);
        }];
    }
};
