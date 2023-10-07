<h1>Ongoing Jobs</h1>
{#if dataGraphItems.length > 0}
<!-- <LineChart title="Graph" data="{items.map(x => { return {value: x.temperature, date: x.updatedAt} })}"/> -->
  <LineChart title="Graph" data="{dataGraphItems}" xScale="{xScale}" dataPoints="{dataPoints}" xAxis="{xAxis}" yAxis="{yAxis}"/>
{/if}
<DataTable
  sortable
  bind:sort
  bind:sortDirection
  on:SMUIDataTable:sorted={handleSort}
  table$aria-label="User list"
  style="width: 100%;"
>
  <Head>
    <Row>
      <Cell sortable={false} columnId="id">
        <Label>ID</Label>
      </Cell>
      <Cell sortable={false}>Vibration</Cell>
      <Cell sortable={false}>Mouisture</Cell>
      <Cell columnId="temperature">
        <Label>Temperature</Label>
        <IconButton class="material-icons">arrow_upward</IconButton>
      </Cell>
      <Cell columnId="updatedAt">
        <Label>Updated At</Label>
        <IconButton class="material-icons">arrow_upward</IconButton>
      </Cell>
      
    </Row>
  </Head>
  <Body>
    {#each items as item (item.id)}
      <Row>
        <Cell>{item.id}</Cell>
        <Cell>{item.vibration}</Cell>
        <Cell>{item.moisture}</Cell>
        <Cell>{item.temperature}</Cell>
        <Cell>{item.updatedAt}</Cell>
        
      </Row>
    {/each}
  </Body>
</DataTable>

<script lang="ts">
  import DataTable, {
    Head,
    Body,
    Row,
    Cell,
    Label,
    SortValue,
  } from '@smui/data-table';
  import IconButton from '@smui/icon-button';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import io from 'socket.io-client';
  import LineChart from './LineChart.svelte';
  import * as d3 from "d3";

  type DataItem = {
    id: string;
    temperature: number;
    vibration: number;
    moisture: number;
    createdAt: string;
    updatedAt: string;
  }

  let sort: keyof DataItem = 'updatedAt';
  let sortDirection: Lowercase<keyof typeof SortValue> = 'descending';
  let items: DataItem[] = [];
  let dataGraphItems: any[] = [];
  let xScale: any;
  let xAxis: any;
  let yAxis: any;
  const yScale = d3
      .scaleLinear()
      // @ts-ignore
    //   .domain([0, d3.max(data, d => d.value)])
      .domain([0, 100])
      // swap [0, height] to have the shapes positioned _from_ the bottom of the svg
      .range([40, 0]);
  let dataPoints: any;
  const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");

  function handleDataChange() {
    handleSort();
    dataGraphItems = items.map(x => { return {value: x.temperature, date: x.updatedAt} });
    dataGraphItems = dataGraphItems.slice(0, 5);
    xScale = d3
      .scaleTime()
      // @ts-ignore
      .domain(d3.extent(dataGraphItems, d => parseTime(d.date)))
      .range([0, 100]);
    // console.log(message.message);
    let points = [0, dataGraphItems.length - 1];
    dataPoints = points.map(point => ({
      // @ts-ignore
      x: xScale(parseTime(dataGraphItems[point].date)),
      // @ts-ignore
      y: yScale(dataGraphItems[point].value),
      // @ts-ignore
      value: dataGraphItems[point].value
    }));

    let minDate = d3.min(dataGraphItems, d => parseTime(d.date));
    let maxDate = d3.max(dataGraphItems, d => parseTime(d.date));
    // @ts-ignore
    const q1 = d3.quantile(dataGraphItems, 0.25, d => parseTime(d.date));
    // @ts-ignore
    const q2 = d3.quantile(dataGraphItems, 0.5, d => parseTime(d.date));
    // @ts-ignore
    const q3 = d3.quantile(dataGraphItems, 0.75, d => parseTime(d.date));

    xAxis = [minDate, q1, q2, q3, maxDate];

    let maxValue = d3.max(dataGraphItems, d => d.value);
    const yTicks = 10;
    // @ts-ignore
    yAxis = Array(Math.floor(maxValue / yTicks))
      // @ts-ignore
      .fill()
      // @ts-ignore
      .map((value, index) => (index + 1) * yTicks);
  };
  onMount(() => {

    const socket = io('http://localhost:3001');

  //   socket.emit('register', userEmail);

  socket.on('initialData', (message) => {
      // Perform action on receiving a new message
      console.log(message);
      items = message;
      console.log('Graph Items' + dataGraphItems.length);
      // handleSort();
      handleDataChange();
    });

    socket.on('newElement', (message) => {
      // Perform action on receiving a new message
      console.log(message);
      items.unshift(message)
      items = items;
      handleDataChange();
    });

  });

  function handleSort() {
    items.sort((a, b) => {
      const [aVal, bVal] = [a[sort], b[sort]][
        sortDirection === 'ascending' ? 'slice' : 'reverse'
      ]();
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal);
      }
      return Number(aVal) - Number(bVal);
    });
    items = items;
  }

</script>
  