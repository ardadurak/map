import { Stocks, MapData } from '../shared';

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

import * as Datamap from 'datamaps';
import * as Topojson from 'topojson';

@Component({
  selector: 'app-datamap',
  template: `
    <div id="container" style="position: relative; width: 800px; height: 500px;"></div>
  `
})

export class DatamapComponent implements OnInit, OnDestroy {

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
    let d3G: Selection<SVGGElement, any, null, undefined>;
   var map = new Datamap({

        element: document.getElementById('container'),
        projection: 'mercator',
        responsive: true,
        highlightFillColor: '#0091DA',
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
          radius: 3,
          country: 'USA',
          fillKey: 'bubble',
          centered: 'USA',
          borderWidth: 0,
          fillOpacity: 1,
          highlightOnHover: false
        },{
          name: 'GBR',
          radius: 3,
          country: 'GBR',
          fillKey: 'bubble',
          centered: 'GBR',
          borderWidth: 0,
          fillOpacity: 1,
          highlightOnHover: false
        }
      ]);
      map.arc([
        {
            origin: 'USA',
            destination: {
                latitude: 30,
                longitude: -50
            },
            options: {
              strokeWidth: 3,
              strokeColor: '#747474',
              greatArc: true,
              animationSpeed: 2000
            }
        },
        {
            origin: 'GBR',
            destination: {
                latitude: 70,
                longitude: 0
            },
            options: {
              strokeWidth: 3,
              strokeColor: '#747474',
              greatArc: false,
              animationSpeed: 3000
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
      .style('fill', function(d,i: any){
        return color(i);
      })
      .on("mouseover",function(d:any,i) {
          pies.append("text")
            .attr("dy", ".5em")
            .style("text-anchor", "middle")
            .style("fill", function(d:any,i){return "black";})
            .text(d.data)
        })
        .on("mouseout", function(d) {

                pies.select("text").remove();
            });
      
  }
}