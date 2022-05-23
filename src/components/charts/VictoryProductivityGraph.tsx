import React from 'react';
import { VictoryArea, VictoryChart, VictoryTheme } from 'victory';

export interface IProductivityGraphProps {
    data?: DataObject[];
    showAnimation: boolean;
}
type DataObject = {
    x: string;
    y: number;
};
const ProductivityGraph: React.FunctionComponent<IProductivityGraphProps> = (props) => {
    return (
        // 163.41 * 700
        // viewBox = <min-x> <min-y> <width> <height>
        <svg className="" width={1605} height={255} transform="rotate(90), translate(622,723)">
            <VictoryChart
                style={{
                    parent: { pointerEvents: 'none' }
                }}
                theme={VictoryTheme.material}
                domain={{ y: [0, 7] }}
                horizontal={false}
                standalone={false}
                width={1605}
                height={255}
            >
                <VictoryArea
                    interpolation={'stepBefore'} //monotoneX
                    style={{
                        data: {
                            fill: '#c43a31',
                            stroke: '#c43a31',
                            pointerEvents: 'none'
                        },
                        parent: { border: '1px solid #ccc', pointerEvents: 'none' }
                    }}
                    animate={
                        props.showAnimation
                            ? {
                                  duration: 2000,
                                  onLoad: { duration: 1500 }
                              }
                            : false
                    }
                    data={props.data}
                />
            </VictoryChart>
        </svg>
    );
};

export default ProductivityGraph;
