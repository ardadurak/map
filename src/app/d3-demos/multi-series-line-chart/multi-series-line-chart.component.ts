import { Stocks } from '../shared';

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
    let x: ScaleTime<number, number>; // x
    let y: ScaleLinear<number, number>; //   y;
    let z: ScaleOrdinal<number, string>; //  z;
    let xAxis: Axis<number>;
    let yAxis: Axis<number>;
    let margin = {top: 20, right: 80, bottom: 30, left: 50};
    let line; 
    let data: any;

    data = Stocks.map((v) => v.values.map((v) => new Date(v.date) ))[0];

     if (this.parentNativeElement !== null) {

      d3ParentElement = d3.select(this.parentNativeElement);
      d3Svg = this.d3Svg = d3ParentElement.select<SVGSVGElement>('svg');
      width = +d3Svg.attr('width') - margin.left - margin.right;
      height = +d3Svg.attr('height') - margin.top - margin.bottom;

      d3G = d3Svg.append<SVGGElement>('g').attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x = d3.scaleTime().range([0, width]);
      y = d3.scaleLinear().range([height, 0]);
      z = d3.scaleOrdinal<number, string>(d3.schemeCategory10);
      
      //xAxis = d3.axisBottom(x);
      //yAxis = d3.axisLeft(y);

      line = d3.line()
                        .curve(d3.curveBasis)
                        .x( (d: any) => x(new Date(d.date)) )
                        .y( (d: any) => y(d.close) );

      x.domain(d3.extent(data, (d: Date) => d ));

      y.domain([
        d3.min(Stocks, function(c) { return d3.min(c.values, function(d) { return d.close; }); }),
        d3.max(Stocks, function(c) { return d3.max(c.values, function(d) { return d.close; }); })
      ]);

      z.domain(Stocks.map(function(c) { return c.id; }));

      //drawAxis();
      d3G.append<SVGGElement>('g')
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      d3G.append<SVGGElement>('g')
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
        .append<SVGGElement>('text')
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .text("Value");
        
      //drawPath();

      let stock = d3G.selectAll(".city")
        .data(Stocks)
        .enter().append<SVGGElement>('g')
        .attr("fill", "none")
        .attr("class", "city");

      stock.append<SVGGElement>('path')
        .attr("class", "line")
        .attr("d", (d) => line(d.values) )
        .style("stroke", (d) => z(d.id) );

      stock.append<SVGGElement>('text')
        .datum(function(d) { return {id: d.id, ticker_symbol: d.ticker_symbol, value: d.values[d.values.length - 1]}; })
        .attr("transform", (d) => "translate(" + x(new Date(d.value.date)) + "," + y(d.value.close*1) + ")" )
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "14px sans-serif")
        .text(function(d) { return d.ticker_symbol; });


    }

  }


  
}