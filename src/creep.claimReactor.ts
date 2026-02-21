import { Id, ServerConfig } from "typed-screeps-server";
import _ from 'lodash';
import { ReactorObject } from "./reactor.roomObject";

interface StructureReactor {
    get id(): Id<ReactorObject>;
    get pos(): RoomPosition;
}

interface ClaimReactorIntent {
    id: Id<ReactorObject>;
}

declare module 'typed-screeps-server' {
    interface IntentType {
        // This doesn't work for some reason?
        claimReactor: ClaimReactorIntent;
    }
}

export default function(config: ServerConfig) {
    const C = config.common.constants;

    if(config.engine) {
        config.engine.registerCustomObjectPrototype('dummy', '__dummy', {
            parent: 'Object',
            properties: {},
            prototypeExtender (prototype, scope, {utils}) {
                if(!scope.globals.Creep.prototype.claimReactor) {
                    const C = utils.getRuntimeDriver().constants;

                    Object.defineProperty(scope.globals.Creep.prototype, 'claimReactor', {
                        configurable: false,
                        enumerable: true,
                        value: function(this: Creep, target: StructureReactor) {
                            if(!this.my) {
                                return C.ERR_NOT_OWNER;
                            }
                            if(this.spawning) {
                                return C.ERR_BUSY;
                            }
                            if(!this.body || !this.body.some(p => (p.hits > 0) && (p.type == C.CLAIM))) {
                                return C.ERR_NO_BODYPART;
                            }
                            if(!target || !target.id || !scope.register.customObjects[target.id] || !(target instanceof scope.globals.Reactor)) {
                                scope.register.assertTargetObject(target);
                                return C.ERR_INVALID_TARGET;
                            }
                            if(!target.pos.isNearTo(this.pos)) {
                                return C.ERR_NOT_IN_RANGE;
                            }

                            scope.intents.set(this.id, 'claimReactor', {id: target.id});
                            return C.OK;
                        }
                    });
                }
            }
        });

        config.engine.on('playerSandbox', sandbox => {
            sandbox.run('delete global.__dummy;');
        });

        config.engine.customIntentTypes['claimReactor'] = {id: 'string'};

        // Add "incCounter" command processing
        config.engine.on('processObjectIntents', function(object, userId, objectIntents, roomObjects, roomTerrain, gameTime, roomInfo, bulk, bulkUsers) {

            if (object.type == 'creep' && objectIntents.claimReactor) {
                const intent = objectIntents.claimReactor;
                const target = roomObjects[intent.id];

                if(!target || target.type != 'reactor') {
                    return;
                }

                if(Math.abs(target.x - object.x) > 1 || Math.abs(target.y - object.y) > 1) {
                    return;
                }

                if (object.body.filter(i => i.hits > 0 && i.type == C.CLAIM).length === 0) {
                    return;
                }

                bulk.update(target, { user: object.user });
            }
        });
    }
}