import { useElementSize } from '@custom-react-hooks/use-element-size';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

export type ModernPieChartProps = {
    entities: [string, string];
    attribute: string;
    values: [number, number];
};

const CENTER_GROUP = 'center-group-pie';
const BACKGROUND_ARC = 'background-arc-pie';
const FOREGROUND_ARC = 'foreground-arc-pie';
const LEFT_TEXT = 'left-text';
const RIGHT_TEXT = 'right-text';
const LEFT_VALUE = 'left-value';
const RIGHT_VALUE = 'right-value';

const ENTITY_1_COLOR = 'orange';
const ENTITY_2_COLOR = '#ddd';

type D3Selection<T extends d3.BaseType> = d3.Selection<
    T,
    undefined,
    null | HTMLElement,
    undefined
>;
const selectD3Element = <T extends d3.BaseType, G extends d3.BaseType>(
    selector: string,
    createMethod: () => D3Selection<T>,
    parentElement?: D3Selection<G>
): D3Selection<T> => {
    const selection =
        parentElement?.select<T>(selector) ?? d3.select<T, undefined>(selector);
    if (selection.empty()) return createMethod();

    return selection;
};

const ModernPieChart = ({
    attribute,
    values,
    entities,
}: ModernPieChartProps) => {
    const [svgParentRef, { width: parentWidth, height: parentHeight }] =
        useElementSize();
    const svgRef = useRef<SVGSVGElement>(null);

    const [d3Svg, setd3Svg] =
        useState<d3.Selection<SVGSVGElement, undefined, null, undefined>>();

    useEffect(() => {
        if (!svgRef.current) return;

        setd3Svg(d3.select(svgRef.current));
    }, [svgRef]);

    useEffect(() => {
        if (!d3Svg || !parentHeight || !parentWidth) {
            return;
        }

        const size = Math.min(parentWidth, parentHeight);
        const outerRadius = size / 2 - 10;
        const innerRadius = outerRadius * 0.75;

        // https://tauday.com/tau-manifesto
        const tau = 2 * Math.PI;

        // Create the SVG container, and apply a transform such that the origin is the
        // center of the canvas. This way, we don’t need to position arcs individually.
        const svg = d3Svg.attr('viewBox', [0, 0, parentWidth, parentHeight]);

        const g = selectD3Element<SVGGElement, SVGSVGElement>(
            `#${CENTER_GROUP}`,
            () => svg.append('g').attr('id', CENTER_GROUP),
            svg
        ).attr(
            'transform',
            `translate(${parentWidth / 2},${parentHeight / 2})`
        );
        // An arc function with all values bound except the endAngle. So, to compute an
        // SVG path string for a given angle, we pass an object with an endAngle
        // property to the arc function, and it will return the corresponding string.
        const arc = d3
            .arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .endAngle(tau);

        // Returns a tween for a transition’s "d" attribute, transitioning any selected
        // arcs from their current angle to the specified new angle.
        const arcTween = (newAngle: number) => {
            // The function passed to attrTween is invoked for each selected element when
            // the transition starts, and for each element returns the interpolator to use
            // over the course of transition. This function is thus responsible for
            // determining the starting angle of the transition (which is pulled from the
            // element’s bound datum, d.endAngle), and the ending angle (simply the
            // newAngle argument to the enclosing function).
            // https://d3js.org/d3-transition/modifying#transition_attrTween
            return (d: d3.PieArcDatum<undefined>) => {
                // To interpolate between the two angles, we use the default d3.interpolate.
                // (Internally, this maps to d3.interpolateNumber, since both of the
                // arguments to d3.interpolate are numbers.) The returned function takes a
                // single argument t and returns a number between the starting angle and the
                // ending angle. When t = 0, it returns d.endAngle; when t = 1, it returns
                // newAngle; and for 0 < t < 1 it returns an angle in-between.
                const interpolate = d3.interpolate(d.startAngle, newAngle);

                // The return value of the attrTween is also a function: the function that
                // we want to run for each tick of the transition. Because we used
                // attrTween("d"), the return value of this last function will be set to the
                // "d" attribute at every tick. (It’s also possible to use transition.tween
                // to run arbitrary code for every tick, say if you want to set multiple
                // attributes from a single function.) The argument t ranges from 0, at the
                // start of the transition, to 1, at the end.
                return (t: number) => {
                    // Calculate the current arc angle based on the transition time, t. Since
                    // the t for the transition and the t for the interpolate both range from
                    // 0 to 1, we can pass t directly to the interpolator.
                    //
                    // Note that the interpolated angle is written into the element’s bound
                    // data object! This is important: it means that if the transition were
                    // interrupted, the data bound to the element would still be consistent
                    // with its appearance. Whenever we start a new arc transition, the
                    // correct starting angle can be inferred from the data.
                    d.startAngle = interpolate(t);

                    // Lastly, compute the arc path given the updated data! In effect, this
                    // transition uses data-space interpolation: the data is interpolated
                    // (that is, the end angle) rather than the path string itself.
                    // Interpolating the angles in polar coordinates, rather than the raw path
                    // string, produces valid intermediate arcs during the transition.
                    return arc(d);
                };
            };
        };
        // Add the background arc, from 0 to 100% (tau).

        selectD3Element<SVGPathElement, SVGGElement>(
            `#${BACKGROUND_ARC}`,
            () => g.append('path').attr('id', BACKGROUND_ARC),
            g
        )
            .datum({ startAngle: 0 })
            .style('fill', ENTITY_2_COLOR)
            .attr('d', arc);

        // Add the foreground arc in orange, currently showing 12.7%.
        const foreground = selectD3Element<SVGPathElement, SVGGElement>(
            `#${FOREGROUND_ARC}`,
            () => g.append('path').attr('id', FOREGROUND_ARC),
            g
        )
            .datum({ startAngle: tau })
            .style('fill', ENTITY_1_COLOR)
            .attr('d', arc);
        if (values[0] === undefined || values[1] === undefined) return;

        foreground
            .transition()
            .duration(750)
            .attrTween(
                'd',
                arcTween((1 - values[0] / (values[0] + values[1])) * tau)
            );

        selectD3Element<SVGTextElement, SVGGElement>(
            `#${LEFT_TEXT}`,
            () => g.append('text').attr('id', LEFT_TEXT),
            g
        )
            .text(entities[0])
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'bottom')
            .attr('stroke', ENTITY_1_COLOR)
            .attr('fill', ENTITY_1_COLOR)
            .attr('dx', -20)
            .attr('dy', -20)
            .attr('x', 0)
            .attr('y', 0);

        selectD3Element<SVGTextElement, SVGGElement>(
            `#${LEFT_VALUE}`,
            () => g.append('text').attr('id', LEFT_VALUE),
            g
        )
            .text(values[0])
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'top')
            .attr('stroke', ENTITY_1_COLOR)
            .attr('fill', ENTITY_1_COLOR)
            .attr('dx', -20)
            .attr('dy', 20)
            .attr('x', 0)
            .attr('y', 0);

        selectD3Element<SVGTextElement, SVGGElement>(
            `#${RIGHT_TEXT}`,
            () => g.append('text').attr('id', RIGHT_TEXT),
            g
        )
            .text(entities[1])
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'bottom')
            .attr('stroke', ENTITY_2_COLOR)
            .attr('fill', ENTITY_2_COLOR)
            .attr('dx', 20)
            .attr('dy', -20)
            .attr('x', 0)
            .attr('y', 0);
        selectD3Element<SVGTextElement, SVGGElement>(
            `#${RIGHT_VALUE}`,
            () => g.append('text').attr('id', RIGHT_VALUE),
            g
        )
            .text(values[1])
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'top')
            .attr('stroke', ENTITY_2_COLOR)
            .attr('fill', ENTITY_2_COLOR)
            .attr('dx', 20)
            .attr('dy', 20)
            .attr('x', 0)
            .attr('y', 0);
    }, [parentHeight, parentWidth, d3Svg, values, entities]);

    return (
        <div className="flex h-full w-full flex-col gap-4 overflow-hidden p-4">
            <span className="text-2xl font-bold">{attribute}</span>
            <div ref={svgParentRef} className="h-auto w-full grow">
                <svg className="h-full w-full" ref={svgRef}></svg>
            </div>
        </div>
    );
};

export default ModernPieChart;
