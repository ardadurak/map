import { Stocks } from '../shared';
import { Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChange } from '@angular/core';
import { D3Service, D3, Axis, BrushBehavior, BrushSelection, D3BrushEvent, ScaleLinear, ScaleOrdinal, Selection, Transition} from 'd3-ng2-service';
import * as Datamap from 'datamaps';

@Component({
  selector: 'app-datamap',
  template: `
    <div id="container" style="position: relative; width: 100%; height: 100%;"></div>
  `
})

export class DatamapComponent implements OnInit, OnChanges, OnDestroy {

  @Input() snapshotDate: Date;

  private d3: D3;
  private parentNativeElement: any;
  private d3Svg: Selection<SVGSVGElement, any, null, undefined>;
  private processedStocks : any;

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
    let svgWidth: number, svgHeight: number;
    const xFactorUk = 0.3795136671202318, yFactorUk = 0.608870085225356;
    const xFactorUs = 0.4859626225320041, yFactorUs = 0.16291388766840606;
    let map = this.initMap();
    let grayColor = '#747474';
    let data = [ 
      { "Region": "GBR", "Group1": 10,"Group2": 20,"x": 525,"y": 99 },
      { "Region": "USA","Group1": 10,"Group2": 10, "x": 410, "y": 370 }
    ];
    let processedStocks : any;
    
    processedStocks = this.processedStocks = this.processCalculations();
    d3ParentElement = d3.select(this.parentNativeElement);
    d3Svg = this.d3Svg = d3ParentElement.select<SVGSVGElement>('svg');
    svgWidth = parseFloat( d3Svg.style("width"));
    svgHeight = parseFloat(d3Svg.style('height'));
    let xUk = svgWidth * xFactorUk, xUs = svgWidth * xFactorUs;
    let yUk = svgHeight * yFactorUk, yUs = svgHeight * yFactorUs;
    data[0].x = xUk;
    data[0].y = yUk;
    data[1].x = xUs;
    data[1].y = yUs;   

    d3Svg.append("circle")
      .attr("cx", xUk)
      .attr("cy", yUk)
      .attr("r", 50)
      .attr("fill", grayColor)
      .attr('class', 'circle-uk');
    
    d3Svg.append("circle")
      .attr("cx", xUs) 
      .attr("cy", yUs)
      .attr("r", 50)
      .attr("fill", grayColor)
      .attr('class', 'circle-us');

    var arc : any= d3.arc()
       .innerRadius(20).outerRadius(40);

    var pie = d3.pie()
      .value(function(d: any){ return d });
 
    var pies = d3Svg.selectAll('.pie')
      .data(data)
      .enter()
      .append<SVGGElement>('g')
      .attr('class', 'pie')
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
     });

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    
    pies.selectAll('.slice')
      .data(function(d){
      return pie([d.Group1, d.Group2]); })
      .enter()
      .append<SVGGElement>('path')
      .attr('d',  arc)
      .attr('cursor', 'pointer')
      .style('fill', function(d,i: any){
        return color(i);
      })
      .on("mouseover",function(d:any,i) {
        /*pies.select(this).append("text")
          .attr("dy", ".5em")
          .style("text-anchor", "middle")
          .style("fill", function(d:any,i){return "black";})
          .text(d.data)*/
      })
      .on("mouseout", function(d) {
        pies.select("text").remove();
      })
      .on("click", function(d) {
        //pies.selectAll('.pie').transition().duration(750).attr("d", arcInitial);
        d3.select(this).transition()
          .duration(750)
          .attr("d", arcFinal);
      });

    var arcInitial = d3.arc()
      .startAngle(function(d){ return d.startAngle; })
      .endAngle(function(d){ return d.endAngle; })
      .innerRadius(20)
      .outerRadius(40);
    var arcFinal = d3.arc()
      .startAngle(function(d){ return d.startAngle; })
      .endAngle(function(d){ return d.endAngle; })
      .innerRadius(10)
      .outerRadius(40);  

    window.addEventListener('resize', function(event){
  
      map.resize();
      svgWidth = parseFloat( d3Svg.style("width"));
      svgHeight = parseFloat(d3Svg.style('height'));
      let xUk = svgWidth * xFactorUk, xUs = svgWidth * xFactorUs;
      let yUk = svgHeight * yFactorUk, yUs = svgHeight * yFactorUs;
      data[0].x = xUk;
      data[0].y = yUk;
      data[1].x = xUs;
      data[1].y = yUs;   

      d3Svg.select('.circle-uk')
        .attr("cx", xUk)
        .attr("cy", yUk)

      d3Svg.select('.circle-us')
        .attr("cx", xUs) 
        .attr("cy", yUs)
      
      d3Svg.selectAll('.pie')
        .data(data)
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
      });
    });  
  }
  public processCalculations(){
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
  private initMap(){
    var map =  new Datamap({
      element: document.getElementById('container'),
      projection: 'mercator',
      responsive: true,
      highlightFillColor: 'defaultFill',
      geographyConfig: {
          borderWidth: 0
      },
      fills: {
          defaultFill: "#E6E6E6",
          exists: "#00599C",
          bubble: "#747474"
      },data: {
        USA: { fillKey: "exists" },
        GBR: { fillKey: "exists" }
      }
    });
    map.bubbles([
      {
        name: 'USA',
        radius: 7,
        fillKey: 'bubble',
        borderWidth: 0,
        fillOpacity: 1,
        highlightOnHover: false,
        highlightFillColor: 'bubble',
        highlightBorderColor: 'bubble',
        latitude: 41,
        longitude: -100
      },{
        name: 'GBR',
        radius: 5,
        fillKey: 'bubble',
        centered: 'GBR',
        borderWidth: 0,
        fillOpacity: 1,
        highlightOnHover: false,
        highlightFillColor: 'bubble',
        highlightBorderColor: 'bubble'
      }
    ]);

    map.arc([
      {
          origin: 'USA',
          destination: {
              latitude: 20,
              longitude: -57
          },
          options: {
            strokeWidth: 3,
            strokeColor: '#747474',
            greatArc: true,
            animationSpeed: 1000,
            arcSharpness: 0
          }
      },
      {
          origin: 'GBR',
          destination: {
              latitude: 70,
              longitude: -5
          },
          options: {
            strokeWidth: 3,
            strokeColor: '#747474',
            greatArc: false,
            animationSpeed: 1000,
            arcSharpness: 0
          }
      }
    ],  {strokeWidth: 1, arcSharpness: 1.4});
      return map;
    }
  
   public changeFunction(newDate) {

    
    let newDateTime = newDate.setHours(0, 0, 0, 0);
    console.log(newDateTime);
    
    let result = this.processedStocks.map((v) => {
      return v.values.find(item => {
        return new Date(item.date).setHours(0, 0, 0, 0) == newDateTime;
      })
    })
    /*console.log(newDateTime);
    let mappedResult = this.processedStocks.map((v) => {
      v.values.map((v) => {
        if( new Date(v.date).setHours(0, 0, 0, 0) == newDateTime){
          console.log('found');
        }
        return v.daily_return
      });
    })*/
    console.log(result);
      /*
    this.d3G.selectAll<SVGCircleElement, PhyllotaxisPoint>('circle')
      .data(this.points)
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; })
      .attr('r', this.pointRadius);*/
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes['snapshotDate'] && !changes['snapshotDate'].isFirstChange()) {
      this.changeFunction(changes['snapshotDate'].currentValue);
    }
      /*
      this.processedStocks.map((v) => {
        v.values.map((v) => {
          console.log(v.date);
          if( new Date(v.date) == newDateTime){
            console.log('found');
          }
          return v.daily_return
        });
      });*/


      /*let result =  this.processedStocks.find(item => {
        return new Date(item.values.date).setHours(0, 0, 0, 0) == newDateTime;
      });*/
    }
}