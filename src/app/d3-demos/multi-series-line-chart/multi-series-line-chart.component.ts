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
  private x: ScaleTime<number, number>;

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
    //let x: ScaleTime<number, number>; // x
    let x = this.x;
    let y: ScaleLinear<number, number>; //   y;
    let z: ScaleOrdinal<number, string>; //  z;
    let xAxis: any;
    let yAxis: any;
    let margin: any; // ardadarda
    let line; 
    let data: any;
    
    /*
    let changeStocks = Stocks.map((v) => {
      let initialPrice = v.values[0].close ;
      v.values.map((v) => {
        v.change = ((v.close-initialPrice) / initialPrice) * 100; 
      } ); 
      return v; 
    });*/

    let calcStocks = Stocks.map((v) => {
      var length = v.values.length - 1;
      for(let i = 0 ; i < length ; i++){
        let currentValue = v.values[i];
        v.values[i].change = ((currentValue.close - v.values[i+1].close) / currentValue.close) * 100; // daily return
      }
      return v; 
    });
    
    let totalDailyReturn = calcStocks.map((v) => {
      var sum = v.values.reduce(function (previous, key) {
          return previous + key.change;
      }, 0);
      return sum;
    });

    let averageDailyReturn = totalDailyReturn.map((v) => {
        return v / 365;
    });
    console.log(calcStocks);
    console.log(totalDailyReturn);
    console.log(averageDailyReturn);


    data = Stocks.map((v) => v.values.map((v) => new Date(v.date) ))[0];

     if (this.parentNativeElement !== null) {

      d3ParentElement = d3.select(this.parentNativeElement);
      d3Svg = this.d3Svg = d3ParentElement.select<SVGSVGElement>('svg');
      margin = {top: 20, right: 80, bottom: 30, left: 50};
      width = +d3Svg.attr('width') - margin.left - margin.right;
      height = +d3Svg.attr('height') - margin.top - margin.bottom;
    
      d3G = d3Svg.append<SVGGElement>('g').attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x = d3.scaleTime().range([0, width]);
      y = d3.scaleLinear().range([height, 0]);
      z = d3.scaleOrdinal<number, string>(d3.schemeCategory10);
      
      xAxis = d3.axisBottom(x)
      yAxis  = d3.axisLeft(y)

      line = d3.line()
                        .curve(d3.curveBasis)
                        .x( (d: any) => x(new Date(d.date)) )
                        .y( (d: any) => y(d.change) );

      x.domain(d3.extent(data, (d: Date) => d ));

      y.domain([
        d3.min(calcStocks, function(c) { return d3.min(c.values, function(d) { return d.change; }); }),
        d3.max(calcStocks, function(c) { return d3.max(c.values, function(d) { return d.change; }); })
      ]);

      z.domain(calcStocks.map(function(c) { return c.id; }));

      //drawAxis();
      d3G.append<SVGGElement>('g')
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      d3G.append('g')
        .attr("class", "axis axis--y")
        .call(yAxis)
        .append<SVGGElement>('text')
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("color", "#ff0000")
        .text("%");
        
      //drawPath();

      let stock = d3G.selectAll(".stock")
        .data(calcStocks)
        .enter().append<SVGGElement>('g')
        .attr("fill", "none")
        .attr("class", "stock")
        .on("mousemove", mousemove);

      stock.append<SVGGElement>('path')
        .attr("class", "line")
        .attr("d", (d) => line(d.values) )
        .style("stroke", (d) => z(d.id) );

      stock.append<SVGGElement>('text')
        .datum(function(d) { return {id: d.id, ticker_symbol: d.ticker_symbol, value: d.values[d.values.length - 1]}; })
        .attr("transform", (d) => "translate(" + x(new Date(d.value.date)) + "," + y(d.value.change*1) + ")" )
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "14px sans-serif")
        .text(function(d) { return d.ticker_symbol; });

      var focus = d3Svg.append<SVGGElement>("g")
          .attr("class", "focus")
          .style("display", "none");

    }
    function mousemove(){
      
      var x0 = x.invert(d3.mouse(this)[0]);
      var y0= d3.mouse(this)[1];
      //var i = this.stock(calcStocks, x0, 1);
      //var d0 = d3G.data[i - 1];
      //var d1 = d3G.data[i];
      console.log("x0" + x0);
       //console.log("d0" + d0);
        //console.log("d1" + d1);
          

         
    }
  }
}