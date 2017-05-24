$(function () {
    var charts= [];
    var positiveOrNegativeSeries = [
        { color:"#4572A7", name: "C1", seriesName:"LongShort",
            data:[0.739, 0.935, 0.738, 0.789, 0.769, 0.838, 0.941] },
        { color:"#4572A7",name: "C1", seriesName:"LongShort", showInLegend: false,
            data:[-0.81, -0.829, -0.886, -0.888, -1.004, -0.784, -0.792] },
        { color:"#AA4643",name: "C2", seriesName:"LongShort",
            data:[1.138,0.88,0.75,0.64,0.287,0.287,0.388]},
        { color:"#AA4643",name: "C2", seriesName:"LongShort", showInLegend: false,
            data:[-1.323,-1.193,-1.093,-0.831,-0.727,-0.695,-0.704]},
        { color:"#89A54E",name: "C3", seriesName:"LongShort",
            data:[1.918,2.554,1.913,3.398,3.212,3.379,2.401]},
        { color:"#89A54E",name: "C3",seriesName:"LongShort",showInLegend:false,
            data:[-0.953,-0.913,-1.106,-2.246,-1.78,-1.393,-1.006]},
        { color:"#673D67",name: "C4",seriesName:"LongShort",
            data:[2.336,2.56,2.464,2.328,2.1,2.09,2.048]},
        { color:"#673D67",name: "C4",seriesName:"LongShort",showInLegend: false,
            data:[-1.884,-2.073,-1.9,-1.91,-1.79,-1.73,-1.633]},
        { color:"#386363",name: "C5",seriesName:"LongShort",
            data:[1.077,1.244,1.081,1.057,0.965,0.955,0.973]},
        { color:"#386363",name: "C5",seriesName:"LongShort",showInLegend:false,
            data:[-1.109,-1.091,-0.91,-0.878,-0.967,-0.841,-0.917]}
    ];
    var mixSeries = [
        // only positives
        { name: "C1(P)", seriesName:"LongShort",
            data:[0.739, 0.935, 0.738, 0.789, 0.769, 0.838, 0.941] },
        { name: "C2(P)", seriesName:"LongShort",
            data:[1.4, 2.8, 1.9, 4.3, 2.2, 2.67, 3.40]},
        // only negatives
        { name: "C3(N)", seriesName:"LongShort",
            data:[-0.81, -0.829, -0.886, -1.888, -1.004, -2.784, -1.792] },
        { name: "C4(N)",seriesName:"LongShort",
            data:[-0.953,-0.913,-1.106,-2.246,-1.78,-1.393,-1.006]},
        //positives and negatives
        { name: "C5(MIX)", seriesName:"LongShort",
            data:[1.918,-2.554,-1.913,3.398,-3.212,-3.379,2.401]},
        { name: "C6(MIX)",seriesName:"LongShort",
            data:[2.336,-2.56,-2.464,2.328,-2.1,-2.09,2.048]},
    ];
    Highcharts.setOptions({
        chart: { type: 'areaspline' },
        title: { text: '' },
        xAxis: { categories: ['c1','c2','c3','c4','c5','c6','c7'],  title: { enabled: false } },
        yAxis: {
            labels: { formatter: function() {  return (this.value * 100).toFixed(0);  } },
            plotLines: [{ color: 'Black', value: 0, width: 2, dashStyle: 'Solid', zIndex: 5}]
        },
        tooltip: { useHTML:true,
            formatter: function() {
                return this.x + '<br/>' + this.series.name + ':' + (this.y * 100).toFixed(2);
            }
        },
        plotOptions: {
            areaspline: { stacking: 'normal',
                lineWidth:0,
                marker: { enabled:false },
                events: { legendItemClick: function (event) {
                    var visible = this.visible, series = this.chart.series, name = this.name;
                    for (var i = 0; i < series.length; i++) {
                        if (name == series[i].name) {
                            if (visible) { series[i].hide(); }
                            else { series[i].show(); }
                        }
                    } return false;
                }
                }}}
    });
    var chart1 = new Highcharts.Chart({ chart: { renderTo:'container1' }, series: positiveOrNegativeSeries });
    var chart2 = new Highcharts.Chart({ chart: { renderTo:'container2' }, series: mixSeries });
});