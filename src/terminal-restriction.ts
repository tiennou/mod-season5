import { ServerConfig, RawStructureTerminal } from "typed-screeps-server";
import _ from 'lodash';

export default function (config: ServerConfig) {
    if(config.engine && config.engine.driver) {
        const oldGetInterRoom = config.engine.driver.getInterRoom;
        config.engine.driver.getInterRoom = async function() {
            const data = await oldGetInterRoom();
            const terminals = _.filter(data[3], {type: 'terminal'}) as RawStructureTerminal[];
            for(let terminal of terminals) {
                if(!terminal.send || !terminal.send.targetRoomName) {
                    continue;
                }
                const target = _.find(terminals, {room: terminal.send.targetRoomName});
                if(target && (terminal.user != target.user)) {
                    terminal.send = null;
                }
            }
            return data;
        }
    }
}
