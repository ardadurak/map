import { Stocks } from '../shared';
import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { D3Service, D3, Axis, BrushBehavior, BrushSelection, D3BrushEvent, ScaleTime, ScaleLinear, ScaleOrdinal, Selection, Transition} from 'd3-ng2-service';

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
    let x: ScaleTime<number, number>; // x
    let y: ScaleLinear<number, number>; //   y;
    let z: ScaleOrdinal<number, string>; //  z;
    let xAxis: any;
    let yAxis: any;
    let margin: any; 
    let line; 
    let dateData: any;
    let graphAttribute = 'change';
    
    var processedStocks = processCalculations();
    dateData = Stocks.map((v) => v.values.map((v) => new Date(v.date) ))[0];
    if (this.parentNativeElement !== null) {
      d3ParentElement = d3.select(this.parentNativeElement);
      d3Svg = d3ParentElement.select<SVGSVGElement>('svg');
      drawGraph(this.parentNativeElement);
    }

    
    function drawGraph(parentNativeElement){
     
      margin = {top: 20, right: 80, bottom: 30, left: 50};
      width = +d3Svg.attr('width') - margin.left - margin.right;
      height = +d3Svg.attr('height') - margin.top - margin.bottom;
      
      d3G = d3Svg
            .append<SVGGElement>('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x = d3.scaleTime().range([0, width]);
      y = d3.scaleLinear().range([height, 0]);
      z = d3.scaleOrdinal<number, string>(d3.schemeCategory10);
      
      xAxis = d3.axisBottom(x)
      yAxis  = d3.axisLeft(y)

      line = d3.line()
        .curve(d3.curveBasis)
        .x( (d: any) => x(new Date(d.date)) )
        .y( (d: any) => y(d[graphAttribute]) );

      x.domain(d3.extent(dateData, (d: Date) => d ));

      y.domain([
        d3.min(processedStocks, function(c) { return d3.min(c.values, function(d) { return d[graphAttribute]; }); }),
        d3.max(processedStocks, function(c) { return d3.max(c.values, function(d) { return d[graphAttribute]; }); })
      ]);

      z.domain(processedStocks.map(function(c) { return c.id; }));

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
        .data(processedStocks)
        .enter().append<SVGGElement>('g')
        .attr("fill", "none")
        .attr("class", "stock")
        .on("mousemove", mousemove);

      stock.append('path')
        .attr("class", "line")
        .attr("d", (d) => line(d.values) )
        .style("stroke", (d) => z(d.id) );

      stock.append('text')
        .datum(function(d) { return {id: d.id, ticker_symbol: d.ticker_symbol, value: d.values[d.values.length - 1]}; })
        .attr("transform", (d) => "translate(" + x(new Date(d.value.date)) + "," + y(d.value[graphAttribute]*1) + ")" )
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "14px sans-serif")
        .attr('class', 'heeey')
        .text(function(d) { return d.ticker_symbol; });

      var focus = d3Svg.append("g")
          .attr("class", "focus")
          .style("display", "none");
    }

    function mousemove(){
      var x0 = x.invert(d3.mouse(this)[0]);
      var y0= d3.mouse(this)[1];
      //var i = this.stock(processedStocks, x0, 1);
      //var d0 = d3G.data[i - 1];
      //var d1 = d3G.data[i];
      console.log("x0" + x0);
       //console.log("d0" + d0);
        //console.log("d1" + d1);
    }

    function processCalculations(){
      return Stocks.map((v) => {
        var length = v.values.length;
        //v.minDailyReturn = ((v.values[1].close - v.values[0].close) / v.values[1].close) * 100; 
        //v.maxDailyReturn = v.minDailyReturn;
        let initialPrice = v.values[0].close ;
        let totalDailyReturn = 0;
        for(let i = 1 ; i < length ; i++){
          let currentValue = v.values[i];
          let dailyReturn = ((currentValue.close - v.values[i-1].close) / currentValue.close) * 100; // daily return
          totalDailyReturn = totalDailyReturn + dailyReturn;
          /*
          // Calculate min and max daily return values
          if(dailyReturn < v.minDailyReturn){
            v.minDailyReturn = dailyReturn;
          }
          else if(dailyReturn > v.maxDailyReturn){
            v.maxDailyReturn = dailyReturn;
          }*/

          v.values[i].daily_return = dailyReturn; // daily return value
          v.values[i].change = ((currentValue.close-initialPrice) / initialPrice) * 100;  // change rate value
        }
        v.averageDailyReturn = totalDailyReturn / length;
        v.annualReturn = parseFloat((Math.round((Math.pow(((v.averageDailyReturn / 100) + 1 ), length) - 1) * 100 * 100)/ 100).toFixed(2));

        return v; 
      });
    }
  }
}