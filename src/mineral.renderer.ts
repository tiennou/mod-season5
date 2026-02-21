import { ServerConfig } from "typed-screeps-server";
import { flickering, fg, bg } from "./renderer.utils";

export default function(config: ServerConfig) {
    if(config.backend) {
        config.backend.renderer.resources['T'] = `${config.assetsUrl}T.png`;
        config.backend.renderer.resources['extractor'] = `${config.assetsUrl}extractor.svg`;

        config.backend.renderer.metadata.mineral = {
            calculations: [
                {
                    id: 'foregroundColor',
                    props: ['mineralType'],
                    once: true,
                    func: fg,
                },
                {
                    id: 'backgroundColor',
                    props: ['mineralType'],
                    once: true,
                    func: bg,
                }
            ],
            processors: [
                {
                    type: 'draw',
                    once: true,
                    when: { $not: { $eq: [{ $state: 'mineralType' }, 'T'] } },
                    payload: {
                        drawings: [
                            {
                                method: 'lineStyle',
                                params: [
                                    10,
                                    { $calc: 'foregroundColor' },
                                    1,
                                ],
                            },
                            { method: 'beginFill', params: [{ $calc: 'backgroundColor' }] },
                            {
                                method: 'drawCircle',
                                params: [
                                    0,
                                    0,
                                    54,
                                ],
                            },
                            { method: 'endFill' },
                        ],
                    },
                },
                {
                    type: 'text',
                    once: true,
                    when: { $not: { $eq: [{ $state: 'mineralType' }, 'T'] } },
                    payload: {
                        text: { $state: 'mineralType' },
                        style: {
                            align: 'center',
                            fill: { $calc: 'foregroundColor' },
                            fontFamily: 'Roboto, serif',
                            fontSize: 82,
                            fontWeight: 'bold',
                        },
                        anchor: {
                            x: 0.5,
                            y: 0.5,
                        },
                    },
                },
                {
                    type: 'sprite',
                    once: true,
                    when: { $eq: [{ $state: 'mineralType' }, 'T'] },
                    payload: {
                        texture: 'T',
                        width: 128,
                        height: 128
                    },
                },
                {
                    type: 'sprite',
                    once: true,
                    layer: 'lighting',
                    payload: {
                        texture: 'glow',
                        width: 200,
                        height: 200,
                        alpha: 1,
                    },
                },
                {
                    type: 'sprite',
                    once: true,
                    layer: 'lighting',
                    payload: {
                        texture: 'glow',
                        width: 700,
                        height: 700,
                        alpha: 0.7,
                        tint: { $calc: 'foregroundColor' },
                    },
                    actions: [flickering(0.7, 0.4, 1.0, 0.4)],
                },
            ],
            zIndex: 1,
        };
    }
}
