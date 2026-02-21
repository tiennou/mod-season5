import { Expression } from "@screeps/renderer";

export const flickering = (alpha1: number, alpha2: number, alpha3: number, alpha4: number) => ({
    action: 'Spawn',
    params: [[
        {
            action: 'Repeat',
            params: [{
                action: 'Sequence',
                params: [[
                    {
                        action: 'ScaleTo',
                        params: [
                            { $rel: 'scale.x', koef: 1.2 },
                            { $rel: 'scale.y', koef: 1.2 },
                            1,
                        ],
                    },
                    {
                        action: 'ScaleTo',
                        params: [
                            { $rel: 'scale.x' },
                            { $rel: 'scale.y' },
                            1,
                        ],
                    },
                ]],
            }],
        },
        {
            action: 'Repeat',
            params: [{
                action: 'Sequence',
                params: [[
                    {
                        action: 'AlphaTo',
                        params: [alpha1, 0.1],
                    },
                    {
                        action: 'AlphaTo',
                        params: [alpha2, 0.2],
                    },
                    {
                        action: 'DelayTime',
                        params: [{ $random: 2 }],
                    },
                    {
                        action: 'AlphaTo',
                        params: [alpha3, 0.2],
                    },
                    {
                        action: 'AlphaTo',
                        params: [alpha4, 2.8],
                    },
                ]],
            }],
        },
    ]],
});

type HexColor = number;
type Expr<T> =
  | T
  | {
      $if: {
        $eq: [a: Expr<any>, b: Expr<any>];
      };
      then: Expr<T>;
      else: Expr<T>;
    };

export const fg = () => {
    const colors = { L: 0x89F4A5, U: 0x88D6F7, K: 0x9370FF, Z: 0xF2D28B, X: 0xFF7A7A, O: 0xCCCCCC, H: 0xCCCCCC, T: 0xBCFF50 };
    let calc: Expression<HexColor> = 0xFFFFFF;
    for(const symbol in colors) {
        calc = { $if: {$eq: [{$state: 'mineralType'}, symbol]}, then: colors[symbol as keyof typeof colors], else: calc };
    }

    return calc;
}

export const bg = () => {
    const colors = { L: 0x3F6147, U: 0x1B617F, K: 0x331A80, Z: 0x594D33, X: 0x4F2626, O: 0x4D4D4D, H: 0x4D4D4D, T: 0x67A700 };
    let calc: Expression<HexColor> = 0x000000;
    for(const symbol in colors) {
        calc = { $if: {$eq: [{$state: 'mineralType'}, symbol]}, then: colors[symbol as keyof typeof colors], else: calc };
    }

    return calc;
}

