import { Stocks } from '../shared/';

import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';


import {
  D3Service,
  D3,
  Axis,
  BrushBehavior,
  BrushSelection,
  D3BrushEvent,
  ScaleTime,
  ScaleLinear,
  ScaleOrdinal,
  Selection,
  Transition
} from 'd3-ng2-service';

@Component({
  selector: 'app-multiserieslinechart',
  template: `<svg width="960" height="600"></svg>`
})

export class MultiSeriesLineChartComponent implements OnInit, OnDestroy {

  private d3: D3;
  private parentNativeElement: any;
  private d3Svg: Selection<SVGSVGElement, any, null, undefined>;

  constructor(element: ElementRef, private ngZone: NgZone, d3Service: D3Service) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;
  }

  ngOnDestroy() {
    if (this.d3Svg.empty && !this.d3Svg.empty()) {
      this.d3Svg.selectAll('*').remove();
    }
  }

  ngOnInit() {
    let self = this;
    let d3 = this.d3;
    let d3ParentElement: Selection<HTMLElement, any, null, undefined>;
    let d3Svg: Selection<SVGSVGElement, any, null, undefined>;
    let d3G: Selection<SVGGElement, any, null, undefined>; //  g: any;
    let width: number;
    let height: number;
    let height2: number;
    let x: any;
    let x2: any;
    let y: any;
    let y1: any;
    let y2: any;
    let y3: any;
    let z: ScaleOrdinal<number, string>; //  z;
    let xAxis: any;
    let xAxis2: any;
    let yAxis: any;
    let margin: any;
    let margin2: any;
    let line; 
    let data: any;

    margin = {top: 30, right: 20, bottom: 100, left: 50};
    margin2  = {top: 210, right: 20, bottom: 20, left: 50};
    width    = + 764 - margin.left - margin.right;
    height   = + 283 - margin.top - margin.bottom;
    height2  = 283 - margin2.top - margin2.bottom;

    var parseDate = d3.timeFormat('%d/%m/%Y');
    var bisectDate = d3.bisector(function(d:any) { return d.date; }).left;
    var legendFormat = d3.timeFormat('%b %d, %Y');

    x = d3.scaleTime().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);
    z = d3.scaleOrdinal<number, string>(d3.schemeCategory10);

    x = d3.scaleTime().range([0, width]);
    x2  = d3.scaleTime().range([0, width]);
    y   = d3.scaleLinear().range([height, 0]);
    y1  = d3.scaleLinear().range([height, 0]);
    y2  = d3.scaleLinear().range([height2, 0]);
    y3  = d3.scaleLinear().range([60, 0]);

    xAxis = d3.axisBottom(x)
    xAxis2  = d3.axisBottom(x2)
    yAxis   = d3.axisLeft(y)

  var priceLine = d3.line()
    .x(function(d:any) { return x(d.date); })
    .y(function(d:any) { return y(d.close); })
    .curve(d3.curveMonotoneX);;

  var avgLine = d3.line()
    .x(function(d:any) { return x(d.date); })
    .y(function(d:any) { return y(d.average); })
    .curve(d3.curveMonotoneX);

  var area2 = d3.area()
    .x(function(d:any) { return x2(d.date); })
    .y0(height2)
    .y1(function(d:any) { return y2(d.close); })
    .curve(d3.curveMonotoneX);

  d3ParentElement = d3.select(this.parentNativeElement);
  d3Svg = this.d3Svg = d3ParentElement.select<SVGSVGElement>('svg')
    .attr('class', 'chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom + 60);

  d3Svg.append<SVGGElement>('defs').append<SVGGElement>('clipPath')
    .attr('id', 'clip')
  .append<SVGGElement>('rect')
    .attr('width', width)
    .attr('height', height);

  var make_y_axis: any = function () {
    return d3.axisLeft(y).ticks(3);
  };

  var focus = d3Svg.append<SVGGElement>('g')
    .attr('class', 'focus')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var barsGroup = d3Svg.append<SVGGElement>('g')
    .attr('class', 'volume')
    .attr('clip-path', 'url(#clip)')
    .attr('transform', 'translate(' + margin.left + ',' + (margin.top + 60 + 20) + ')');

  var context = d3Svg.append<SVGGElement>('g')
    .attr('class', 'context')
    .attr('transform', 'translate(' + margin2.left + ',' + (margin2.top + 60) + ')');

  var legend = d3Svg.append<SVGGElement>('g')
    .attr('class', 'chart__legend')
    .attr('width', width)
    .attr('height', 30)
    .attr('transform', 'translate(' + margin2.left + ', 10)');

  legend.append<SVGGElement>('text')
    .attr('class', 'chart__symbol')
    .text('NASDAQ: AAPL')

  var rangeSelection =  legend
    .append<SVGGElement>('g')
    .attr('class', 'chart__range-selection')
    .attr('transform', 'translate(110, 0)');

    data = Stocks.map((v) => v.values.map((v) => new Date(v.date) ))[0];
    data = Stocks[0].values; // data ile ilgili, extent vs
    
    var brush = d3.brushX()
      //.extent(x2)
      .on('brush', brushed);

    var xRange = d3.extent(data.map(function(d:any) { return d.date; }));

    x.domain(xRange);
    y.domain(d3.extent(data.map(function(d:any) { return d.close; })));
    y3.domain(d3.extent(data.map(function(d:any) { return d.close; })));
    x2.domain(x.domain());
    y2.domain(y.domain());

    var min = d3.min(data.map(function(d:any) { return d.close; }));
    var max = d3.max(data.map(function(d:any) { return d.close; }));

    var range = legend.append<SVGGElement>('text')
      .text(legendFormat(new Date(xRange[0])) + ' - ' + legendFormat(new Date(xRange[1])))
      .style('text-anchor', 'end')
      .attr('transform', 'translate(' + width + ', 0)');

    focus.append<SVGGElement>('g')
        .attr('class', 'y chart__grid')
        .call(make_y_axis()
        .tickSize(-width, 0, 0)
        .tickFormat(''));

    var averageChart = focus.append<SVGGElement>('path')
        .datum(data)
        .attr('class', 'chart__line chart__average--focus line')
        .attr('d', avgLine);

    var priceChart = focus.append<SVGGElement>('path')
        .datum(data)
        .attr('class', 'chart__line chart__price--focus line')
        .attr('d', priceLine);

    focus.append<SVGGElement>('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0 ,' + height + ')')
        .call(xAxis);

    focus.append<SVGGElement>('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(12, 0)')
        .call(yAxis);

    var focusGraph = barsGroup.selectAll('rect')
        .data(data)
      .enter().append<SVGGElement>('rect')
        .attr('class', 'chart__bars')
        .attr('x', function(d: any, i) { return x(d.date); })
        .attr('y', function(d:any) { return 155 - y3(d.close); })
        .attr('width', 1)
        .attr('height', function(d:any) { return y3(d.close); });

    var helper = focus.append<SVGGElement>('g')
      .attr('class', 'chart__helper')
      .style('text-anchor', 'end')
      .attr('transform', 'translate(' + width + ', 0)');

    var helperText = helper.append<SVGGElement>('text')

    var priceTooltip = focus.append<SVGGElement>('g')
      .attr('class', 'chart__tooltip--price')
      .append<SVGGElement>('circle')
      .style('display', 'none')
      .attr('r', 2.5);

    var averageTooltip = focus.append<SVGGElement>('g')
      .attr('class', 'chart__tooltip--average')
      .append<SVGGElement>('circle')
      .style('display', 'none')
      .attr('r', 2.5);

    var mouseArea = d3Svg.append<SVGGElement>('g')
      .attr('class', 'chart__mouse')
      .append<SVGGElement>('rect')
      .attr('class', 'chart__overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .on('mouseover', function() {
        helper.style('display', null);
        priceTooltip.style('display', null);
        averageTooltip.style('display', null);
      })
      .on('mouseout', function() {
        helper.style('display', 'none');
        priceTooltip.style('display', 'none');
        averageTooltip.style('display', 'none');
      })
      .on('mousemove', mousemove);

    context.append<SVGGElement>('path')
        .datum(data)
        .attr('class', 'chart__area area')
        .attr('d', area2);

    context.append<SVGGElement>('g')
        .attr('class', 'x axis chart__axis--context')
        .attr('y', 0)
        .attr('transform', 'translate(0,' + (height2 - 22) + ')')
        .call(xAxis2);

    context.append<SVGGElement>('g')
        .attr('class', 'x brush')
        .call(brush)
      .selectAll('rect')
        .attr('y', -6)
        .attr('height', height2 + 7);

    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]);
      var i = bisectDate(data, x0, 1);
      var d0 = data[i - 1];
      var d1 = data[i];
      var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      helperText.text(legendFormat(new Date(d.date)) + ' - Price: ' + d.close + ' Avg: ' + d.average);
      priceTooltip.attr('transform', 'translate(' + x(d.date) + ',' + y(d.close) + ')');
      averageTooltip.attr('transform', 'translate(' + x(d.date) + ',' + y((d.high+d.low)/2) + ')');
    }

    function brushed() {
      var ext = d3.event.selection;
      if (d3.event.sourceEvent) {
        x.domain(!d3.event.sourceEventbrush.empty() ? x2.domain() : brush.extent());
        y.domain([
          d3.min(data.map(function(d:any) { return (d.date >= ext[0] && d.date <= ext[1]) ? d.close : max; })),
          d3.max(data.map(function(d:any) { return (d.date >= ext[0] && d.date <= ext[1]) ? d.close : min; }))
        ]);
        range.text(legendFormat(new Date(ext[0])) + ' - ' + legendFormat(new Date(ext[1])))
        focusGraph.attr('x', function(d: any, i) { return x(d.date); });

        var days = Math.ceil((ext[1] - ext[0]) / (24 * 3600 * 1000))
        focusGraph.attr('width', (40 > days) ? (40 - days) * 5 / 6 : 5)
      }

      priceChart.attr('d', priceLine);
      averageChart.attr('d', avgLine);
      focus.select('.x.axis').call(xAxis);
      focus.select('.y.axis').call(yAxis);
    }

    var dateRange = ['1w', '1m', '3m', '6m', '1y', '5y']
    for (var i = 0, l = dateRange.length; i < l; i ++) {
      var v = dateRange[i];
      rangeSelection
        .append<SVGGElement>('text')
        .attr('class', 'chart__range-selection')
        .text(v)
        .attr('transform', 'translate(' + (18 * i) + ', 0)');
        //.on('click', function(d:any) { focusOnRange(this.textContent); }); // ardadarda
    }

    function focusOnRange(range) {
      var today = new Date(data[data.length - 1].date)
      var ext = new Date(data[data.length - 1].date)

      if (range === '1m')
        ext.setMonth(ext.getMonth() - 1)

      if (range === '1w')
        ext.setDate(ext.getDate() - 7)

      if (range === '3m')
        ext.setMonth(ext.getMonth() - 3)

      if (range === '6m')
        ext.setMonth(ext.getMonth() - 6)

      if (range === '1y')
        ext.setFullYear(ext.getFullYear() - 1)

      if (range === '5y')
        ext.setFullYear(ext.getFullYear() - 5)

     // brush.extent([ext, today]) arddarda
      brushed()
      //context.select('g.x.brush').call(brush.extent([ext, today]))
    }

    function type(d): any {
    return {
      date    : this.d3.parseDate(d.Date),
      price   : +d.Close,
      high : +d.Average,
      volume : +d.Volume,
    }
  }
  }// end Data
}