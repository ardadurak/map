import { Stocks, MapData } from '../shared';

import { Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChange } from '@angular/core';


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

import * as Datamap from 'datamaps';

@Component({
  selector: 'app-datamap',
  template: `
    <div id="container" style="position: relative; width: 100%; height: 100%;"></div>
  `
})

export class DatamapComponent implements OnInit, OnChanges, OnDestroy {

  @Input() width: number = 400;
  @Input() height: number = 400;
  @Input() phylloRadius: number = 7;
  @Input() pointRadius: number = 2;

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
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
      console.log('here too');
      if (
        (changes['width'] && !changes['width'].isFirstChange()) ||
        (changes['height'] && !changes['height'].isFirstChange()) ||
        (changes['phylloRadius'] && !changes['phylloRadius'].isFirstChange()) ||
        (changes['pointRadius'] && !changes['pointRadius'].isFirstChange())
      ) {
        if (this.d3Svg.empty && !this.d3Svg.empty()) {
          this.changeLayout();
        }
      }
    }
  ngOnInit() {
    let self = this;
    let d3 = this.d3;
    let d3ParentElement: Selection<HTMLElement, any, null, undefined>;
    let d3Svg: Selection<SVGSVGElement, any, null, undefined>;
    let d3G: Selection<SVGGElement, any, null, undefined>;
   var map = new Datamap({

        element: document.getElementById('container'),
        projection: 'mercator',
        responsive: true,
        highlightFillColor: '#0091DA',
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

       var data = [
            {
              "Region": "GBR",
              "Group1": 10,
              "Group2": 20,
              "Group3": 30,
              "Group4": 40,
              "lat": 50,
              "lng": -35
            },
            {
              "Region": "USA",
              "Group1": 10,
              "Group2": 10,
              "Group3": 10,
              "Group4": 10,
              "lat": -20,
              "lng": -70
            }
          ];
      // add arrow http://bl.ocks.org/dem42/e10e933990ee662c9cbd
      d3ParentElement = d3.select(this.parentNativeElement);
      d3Svg = this.d3Svg = d3ParentElement.select<SVGSVGElement>('svg');

      d3Svg.append("circle")
        .attr("cx", 297)
        .attr("cy", 304)
        .attr("r", 50)
        .attr("fill", '#747474');

    d3Svg.append("circle")
        .attr("cx", 388) 
        .attr("cy", 99)
        .attr("r", 50)
        .attr("fill", '#747474');

       var arc : any= d3.arc()
       .innerRadius(20).outerRadius(40),               
      pie = d3.pie()
      .value(function(d: any){ return d });

      var projection = d3.geoProjection(function(x, y) {
        return [x, Math.log(Math.tan(Math.PI / 4 + y / 2))];
      });
 
    var pies = d3Svg.selectAll('.pie')
      .data(data)
      .enter()
      .append<SVGGElement>('g')
      .attr('class', 'pie')
      .attr("transform", function(d) {
        return "translate(" + projection([d.lng, d.lat])[0] + "," + projection([d.lng, d.lat])[1] + ")";
        //return "translate(150px, 300px)";
     });

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    
    pies.selectAll('.slice')
      .data(function(d){
      return pie([d.Group1, d.Group2, d.Group3, d.Group4]); })
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
            
  }
    private changeLayout() {
      console.log('heey change');
      /*
    this.d3Svg
      .attr('width', this.width)
      .attr('height', this.height);
    this.points = this.d3.range(2000).map(phyllotaxis(this.width, this.height, this.phylloRadius));

    this.d3G.selectAll<SVGCircleElement, PhyllotaxisPoint>('circle')
      .data(this.points)
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; })
      .attr('r', this.pointRadius);*/

  }
}