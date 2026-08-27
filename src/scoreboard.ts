import { ServerConfig, User } from "typed-screeps-server";
import _ from 'lodash';

export default function(config: ServerConfig) {
    if(config.backend && config.backend.router) {
        config.backend.router.get('/scoreboard/list', async (request, response) => {
            if(!(parseInt(String(request.query.limit ?? '')) <= 20)) {
                return Promise.reject('invalid params');
            }
            const length = await config.common.storage.db['users'].count({rank: {$exists: true}});
            const start = parseInt(String(request.query.offset ?? 0)), end = parseInt(String(request.query.offset ?? 0)) + parseInt(String(request.query.limit));
            const query: Record<string, unknown> = {rank: {$exists: true, $gt: start, $lte: end}};
            if(request.query.search) {
                query.username = { $regex: request.query.search };
            }
            const users = await config.common.storage.db['users'].find(query, {username: 1, badge: 1, score: 1, rank: 1});

            response.json({ok: 1, users: _.sortBy(users, 'rank'), meta: {length}});
        });
    }

    if(config.cronjobs) {
        config.cronjobs.updateRanks = [60, async function() {
            const users = await config.common.storage.db['users'].find(
                {cpu: {$gt: 0}, usernameLower: {$ne: 'screeps'}},
                {username: 1, score: 1, rank: 1, gcl: 1}) as User[];
            const sortedUsers = _.sortByOrder(users, [u => (u.score||0), u => (u.gcl||0)], ['desc', 'desc']);
            const promises = [];
            for(let i in sortedUsers) {
                const rank = parseInt(i)+1;
                if(sortedUsers[i].rank != rank) {
                    promises.push(config.common.storage.db['users'].update({_id: sortedUsers[i]._id}, {$set: {rank}}));
                }
            }
            await Promise.all(promises);
        }];
    }
};
