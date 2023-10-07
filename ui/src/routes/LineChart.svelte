<script>
    import * as d3 from "d3";

    // @ts-ignore
    export let title;
    /* data describes an array of objects structured to describe a date and a value
        {
            date,
            value
        }
        */
    // @ts-ignore
    export let data;
    // @ts-ignore
    export let xScale;
    // @ts-ignore
    // export let yScale;
    export let dataPoints;
    // @ts-ignore
    export let xAxis;
    // @ts-ignore
    export let yAxis;

    // size of the svg
    console.log("Data length: " + data.length);
    const width = 100;
    const height = 40;

    const margin = {
      top: 15,
      right: 15,
      bottom: 15,
      left: 15
    };

    // timeParse to parse the input data as to create a date object
    const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
    // timeFormat to style the date objects to a chosen format
    const formatTime = d3.timeFormat("%M:%S");

    // horizontally create a scale based on the input dates
    // let xScale = d3
    //   .scaleTime()
    //   // @ts-ignore
    //   .domain(d3.extent(data, d => parseTime(d.date)))
    //   .range([0, width]);

    // vertically  consider the input values
    const yScale = d3
      .scaleLinear()
      // @ts-ignore
    //   .domain([0, d3.max(data, d => d.value)])
      .domain([0, 100])
      // swap [0, height] to have the shapes positioned _from_ the bottom of the svg
      .range([height, 0]);

    // line function mapping the date and value in the svg
    const line = d3
      .line()
      // @ts-ignore
      .x(d => xScale(parseTime(d.date)))
      // @ts-ignore
      .y(d => yScale(d.value))
      .curve(d3.curveCatmullRom);

    // area function describing the area below the curve described by the dates and values
    const area = d3
      .area()
      // @ts-ignore
      .x(d => xScale(parseTime(d.date)))
      // @ts-ignore
      .y0(d => yScale(0))
      // @ts-ignore
      .y1(d => yScale(d.value))
      .curve(d3.curveCatmullRom);

    // points highlighted through circle elements
    // in this instance the first and last
    let points = [0, data.length - 1];
    console.log(data.length);
    console.log(data[0]);
    // let dataPoints = points.map(point => ({
    //   // @ts-ignore
    //   x: xScale(parseTime(data[point].date)),
    //   // @ts-ignore
    //   y: yScale(data[point].value),
    //   // @ts-ignore
    //   value: data[point].value
    // }));

    // "ticks", milestones marked on the x-axis
    // instead of using d3, we create here marks for an arbitrary set of dates
    let minDate = d3.min(data, d => parseTime(d.date));
    let maxDate = d3.max(data, d => parseTime(d.date));
    // @ts-ignore
    const q1 = d3.quantile(data, 0.25, d => parseTime(d.date));
    // @ts-ignore
    const q2 = d3.quantile(data, 0.5, d => parseTime(d.date));
    // @ts-ignore
    const q3 = d3.quantile(data, 0.75, d => parseTime(d.date));

    // let xAxis = [minDate, q1, q2, q3, maxDate];

    // "ticks" for the y-axis
    // the idea is to include 10 values, up to the maximum value
    let maxValue = d3.max(data, d => d.value);
    const yTicks = 10;
    // @ts-ignore
    // const yAxis = Array(Math.floor(maxValue / yTicks))
    //   // @ts-ignore
    //   .fill()
    //   // @ts-ignore
    //   .map((value, index) => (index + 1) * yTicks);

    // variable describing the tooltip
    // the idea is to assign a data point to this variable
    // @ts-ignore
    let tooltip = null;

    // subset of the input data delimited by the data points describing an arbitrary start and end
    // the idea is to highlight the specific area through a different visual (in this instance a repeating linear gradient)
    // @ts-ignore
    let highlightStart = data.findIndex(d => d.start);
    // @ts-ignore
    let highlightEnd = data.findIndex(d => d.end);
    let highlight = data.slice(highlightStart, highlightEnd + 1);
</script>

<style>
    svg {
      width: 100%;
      height: auto;
      display: block;
      color: hsl(200, 95%, 45%);
    }
</style>

<!-- when exiting the article remove the tooltip -->
<article on:mouseout="{() => { tooltip = null; }}">
    <h1>{title}</h1>
    <svg {width} {height} viewBox="0 0 {width + (margin.left + margin.right)} {height + (margin.top + margin.bottom)}">
        <defs>
            <!-- through a carve out the area dedicated to the data points
            this makes it possible to hide elements behind their circles
            ! use the title in the ID to avoid a conflict between multiple svg
            -->
            <mask id="mask-{title.toLowerCase().split(' ').join('-')}">
                <rect x="{-margin.left}" y="{-margin.top}" width="{width + (margin.left + margin.right)}" height="{height + (margin.top + margin.bottom)}" fill="hsl(0, 0%, 100%)" />
                {#each dataPoints as dataPoint}
                <circle fill="hsl(0, 0%, 0%)" stroke="none" r="1.5" cx="{dataPoint.x}" cy="{dataPoint.y}" />
                {/each}
            </mask>
            <!-- repeating linear gradient describing the highlight section
            ! use the title in the ID to avoid a conflict between multiple svg
             -->
            <linearGradient id="gradient-{title.toLowerCase().split(' ').join('-')}" gradientUnits="userSpaceOnUse" spreadMethod="repeat" x1="0" x2="1" y1="0" y2="1">
                <stop stop-color="currentColor" offset="0.5" />
                <stop stop-color="hsl(0, 0%, 100%)" offset="0.5" />
            </linearGradient>
        </defs>
        <g transform="translate({margin.top} {margin.left})">
            <!-- line+area chart
            using the mask to avoid drawing shapes where the highlighted points rest
            -->
            <g mask="url(#mask-{title.toLowerCase().split(' ').join('-')})">
                <!-- area describing the highlight section -->
                <path opacity="0.25" fill="url(#gradient-{title.toLowerCase().split(' ').join('-')})" stroke="none" d="{area(highlight)}" />

                <!-- made-up axes using the dates and values chosen in the Axis variables to draw text and a few lines -->
                <g class="axes">
                    <g transform="translate(0 {height})">
                        <!-- solid dash of the xAxis -->
                        <path fill="none" stroke="hsl(0, 0%, 0%)" stroke-width="0.5" d="M 0 0 h {width}" />
                        {#each xAxis as xTick}
                        <g transform="translate({xScale(xTick)} 0)">
                            <text fill="hsl(0, 0%, 0%)" font-size="3" text-anchor="middle" y="5">{formatTime(xTick)}</text>
                        </g>
                        {/each}
                    </g>
                    {#each yAxis as yTick}
                    <g transform="translate(0 {yScale(yTick)})">
                        <!-- grid lines for the y axis -->
                        <path opacity="0.2" fill="none" stroke="hsl(0, 0%, 0%)" stroke-width="0.5" stroke-dasharray="1" d="M 0 0 h {width}" />
                        <!-- position the text right atop the grid lines -->
                        <text fill="hsl(0, 0%, 0%)" opacity="0.5" font-size="3" text-anchor="start" x="0" y="-1">{yTick}</text>
                    </g>
                    {/each}
                </g>

                <!-- line chart -->
                <path fill="none" stroke="currentColor" stroke-width="1" d="{line(data)}" />
                <!-- area chart -->
                <path opacity="0.15" fill="currentColor" stroke="none" d="{area(data)}" />
            </g>

            <!-- data points highlighted through circle and text elements -->
            {#each dataPoints as dataPoint}
            <circle fill="none" stroke="currentColor" stroke-width="1" r="1.5" cx="{dataPoint.x}" cy="{dataPoint.y}" />
            <text text-anchor="middle" font-size="5" font-weight="bold" fill="currentColor" x="{dataPoint.x}" y="{dataPoint.y - 3}">{dataPoint.value}</text>
            {/each}
            <!-- tooltip described with a text, circle, and a line connecting the data point vertically to the x axis -->
            {#if tooltip}
            <g fill="currentColor" transform="translate({xScale(parseTime(tooltip.date))} {yScale(tooltip.value)})">
                <text text-anchor="middle" font-size="5" font-weight="bold" fill="hsl(0, 0%, 10%)" y="-3">{tooltip.value}</text>
                <path opacity="0.75" fill="none" stroke="hsl(0, 0%, 10%)" stroke-width="0.5" stroke-dasharray="1" d="M 0 0 v {height - yScale(tooltip.value)}" />
                <circle r="2" fill="hsl(0, 0%, 10%)" />
            </g>
            {/if}
            <!-- rectangles included atop the visualization to manage mouse events  -->
            
        </g>
    </svg>
</article>
