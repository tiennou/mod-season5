import { ServerConfig } from "typed-screeps-server";

export default function(config: ServerConfig) {
    if(config.backend) {
        config.backend.renderer.resources['reactor-core'] = `${config.assetsUrl}reactor-core.png`;
        config.backend.renderer.resources['reactor-edge'] = `${config.assetsUrl}reactor-edge.png`;

        config.backend.renderer.metadata.reactor = {
            calculations: [],
            processors: [
                {
                    type: 'sprite',
                    once: true,
                    payload: {
                        id: 'reactor-core',
                        texture: 'reactor-core',
                        width: 150,
                        height: 150
                    },
                },
                {
                    type: 'sprite',
                    once: true,
                    layer: 'lighting',
                    payload: {
                        texture: 'glow',
                        width: 800,
                        height: 800,
                        alpha: 0.8,
                        tint: 0x67A700,
                    }
                },
                {
                    type: 'container',
                    once: true,
                    payload: {
                        id: 'rotateContainer'
                    }
                },
                {
                    type: 'sprite',
                    once: true,
                    payload: {
                        id: 'reactor-edge',
                        texture: 'reactor-edge',
                        parentId: 'rotateContainer',
                        width: 150,
                        height: 150
                    },
                },
                {
                    type: 'sprite',
                    once: true,
                    layer: 'lighting',
                    payload: {
                        texture: 'glow',
                        parentId: 'rotateContainer',
                        width: 150,
                        height: 150,
                        alpha: 0.75,
                        tint: 0xBCFF50,
                        y: 50
                    },
                },
                {
                    type: 'sprite',
                    once: true,
                    layer: 'lighting',
                    payload: {
                        texture: 'glow',
                        parentId: 'rotateContainer',
                        width: 150,
                        height: 150,
                        alpha: 0.75,
                        tint: 0xBCFF50,
                        x: 43,
                        y: -25
                    },
                },
                {
                    type: 'sprite',
                    once: true,
                    layer: 'lighting',
                    payload: {
                        texture: 'glow',
                        parentId: 'rotateContainer',
                        width: 150,
                        height: 150,
                        alpha: 0.75,
                        tint: 0xBCFF50,
                        x: -43,
                        y: -25
                    },
                },
                {
                    type: 'siteProgress',
                    once: true,
                    when: { $state: 'user' },
                    payload: {
                        color: { $calc: 'playerColor' },
                        radius: 30,
                        lineWidth: 6,
                        progress: 0,
                        progressTotal: 1
                    },
                },
                {
                    type: 'userBadge',
                    once: true,
                    when: { $state: 'user' },
                    payload: {
                        color: 0x555555,
                        radius: 29
                    },
                },
                {
                    type: 'runAction',
                    once: true,
                    when: { $and: [{$state: 'store.T'}, {$state: 'user'}] },
                    payload: {
                        id: 'rotateContainer',
                    },
                    actions: [{
                        action: 'Repeat',
                        params: [{
                            action: 'RotateBy',
                            params: [Math.PI, 4],
                        }],
                    }],
                }
            ]
        };
    }
}