import { Stocks } from '../shared';

import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';


import {
  D3Service,
  D3,
  Axis,
  BrushBehavior,
  BrushSelection,
  D3BrushEvent,
  ScaleLinear,
  ScaleOrdinal,
  Selection,
  Transition
} from 'd3-ng2-service';

import * as d3Scale from "d3-scale";
import * as d3Shape from "d3-shape";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";

@Component({
  selector: 'app-multiserieslinechart',
  template: `
     <svg width="960" height="600"></svg>
  `
})

export class MultiSeriesLineChartComponent implements OnInit, OnDestroy {

  title: string = 'Stocks';
  subtitle: string = 'Visualisation Example';

  data: any;
  margin = {top: 20, right: 80, bottom: 30, left: 50};
  g: any;
  width: number;
  height: number;
  x;
  y;
  z;
  line;
  private d3: D3;
  private parentNativeElement: any;
  private d3Svg: Selection<SVGSVGElement, any, null, undefined>;
  private d3ParentElement

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
    let d3G: Selection<SVGGElement, any, null, undefined>;

    this.data = Stocks.map((v) => v.values.map((v) => new Date(v.date) ))[0];
    this.initChart();
    this.drawAxis();
    this.drawPath();
  }


  private initChart(): void {

    let d3ParentElement = this.d3.select(this.parentNativeElement);
    let d3Svg = this.d3Svg = d3ParentElement.select<SVGSVGElement>('svg');
    this.width = +d3Svg.attr('width'); - this.margin.left - this.margin.right;
    this.height = +d3Svg.attr('height'); - this.margin.top - this.margin.bottom;
    this.g = this.d3Svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.z = d3Scale.scaleOrdinal(d3Scale.schemeCategory10);

    this.line = d3Shape.line()
                       .curve(d3Shape.curveBasis)
                       .x( (d: any) => this.x(new Date(d.date)) )
                       .y( (d: any) => this.y(d.close) );

    this.x.domain(d3Array.extent(this.data, (d: Date) => d ));

    this.y.domain([
      d3Array.min(Stocks, function(c) { return d3Array.min(c.values, function(d) { return d.close; }); }),
      d3Array.max(Stocks, function(c) { return d3Array.max(c.values, function(d) { return d.close; }); })
    ]);

    this.z.domain(Stocks.map(function(c) { return c.id; }));
  }

  private drawAxis(): void {
    this.g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3Axis.axisBottom(this.x));

    this.g.append("g")
      .attr("class", "axis axis--y")
      .call(d3Axis.axisLeft(this.y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Value");
  }

  private drawPath(): void {
    let stock = this.g.selectAll(".stock")
      .data(Stocks)
      .enter().append("g")
      .attr("class", "city");

    stock.append("path")
      .attr("class", "line")
      .attr("d", (d) => this.line(d.values) )
      .style("stroke", (d) => this.z(d.id) );

    stock.append("text")
      .datum(function(d) { return {id: d.id, ticker_symbol: d.ticker_symbol, value: d.values[d.values.length - 1]}; })
      .attr("transform", (d) => "translate(" + this.x(new Date(d.value.date)) + "," + this.y(d.value.close*1) + ")" )
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "14px sans-serif")
      .text(function(d) { return d.ticker_symbol; });
  }
}