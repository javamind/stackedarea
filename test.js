/**
 * Directive used to display a chart for the units' loads
 */
export function loadsChart($translate, unitFilter, nameService) {
    'ngInject';

    // http://flatuicolors.com/
    const BASE_COLORS = [
        '#3498db', '#e74c3c',
        '#2ecc71', '#9b59b6',
        '#e67e22', '#34495e',
        '#d35400', '#E91E63',
        '#673AB7', '#8BC34A'];

    return {
        restrict: 'A', // must be an attribute or it does not take the full width
        scope: {
            chart: '=loadsChartData'
        },
        link: function (scope, elem) {

            function getSerieType(chartType, unit) {
                if (unit.type === 'SITE') {
                    return 'spline';
                }
                return chartType === 'energy' ? 'column' : 'area';
            }

            function createSerie(chartType, unit, color, positive) {
                let evaluator = (measure) => {
                    if (measure.load > 0) {
                        return positive ? measure.load : 0;
                    }
                    return positive ? 0 : measure.load;
                };
                return {
                    //Change for energy area in column
                    type: getSerieType(chartType, unit),
                    stack: positive ? 1 : 0,
                    name: unit.type !== 'OTHERLOAD' ? nameService.name(unit) : $translate.instant('loads.chart.residualLoad'),
                    showInLegend: positive,
                    color: unit.type !== 'SITE' ? color : '#000000',
                    dashStyle: unit.type !== 'SITE' ? 'solid' : 'shortdot',
                    data: unit.measurements
                        .map((measure) => {
                        return {x: moment(measure.dateTime).valueOf(), y: positive !== null ? evaluator(measure) : measure.load}
                    }),
                marker: {
                    enabled: false
                }
            }
            }

            /**
             * This weight are used to sort the unit. OtherLoad is the first and the site is the last
             * @param unit
             * @returns {number}
             */
            function typeWeight(unit) {
                switch (unit.type) {
                    case 'CAPACITY':
                        return 1;
                    case 'OTHERLOAD':
                        return 0;
                    case 'SITE':
                        return 10;
                    default:
                        return 2;
                }
            }

            function createSeries(chartType) {
                if (scope.chart.data.units) {
                    return scope.chart.data.units
                            .sort((unit1, unit2) => typeWeight(unit1) - typeWeight(unit2))
                .map((unit, i) => {
                        let color = BASE_COLORS[i % BASE_COLORS.length];
                    if (chartType === 'energy' || unit.type === 'SITE') {
                        return [createSerie(chartType, unit, color, null)];
                    }
                    return [
                        createSerie(chartType, unit, color, true),
                        createSerie(chartType, unit, color, false)
                    ]
                })
                .reduce((a, b) => a.concat(b));
                }
            }

            function createTickInterval() {
                if (scope.chart.duration == 'day') {
                    return 3600 * 1000;
                } else if (scope.chart.duration == 'week') {
                    return 24 * 3600 * 1000;
                } else if (scope.chart.duration == 'month') {
                    return 24 * 3600 * 1000;
                } else if (scope.chart.duration == 'year') {
                    return 24 * 3600 * 1000 * 30;
                }
            }

            function createDateTimeLabelFormats() {
                if (scope.chart.duration == 'day') {
                    return {hour: '%H:%M'};
                } else if (scope.chart.duration == 'week') {
                    return {day: '%d/%m/%Y'};
                } else if (scope.chart.duration == 'month') {
                    return {day: '%d/%m/%Y'};
                } else if (scope.chart.duration == 'year') {
                    return {month: '%m-%Y'};
                }
            }

            function createLabel() {
                if (scope.chart.duration == 'day') {
                    return {align: 'center', x: 0};
                } else if (scope.chart.duration == 'week') {
                    var position = scope.chart.type === 'power' ? 100 : 0;
                    return {align: 'center', x: position};
                } else if (scope.chart.duration == 'month') {
                    return {align: 'center', x: 0, step: 7};
                } else if (scope.chart.duration == 'year') {
                    return {align: 'center', x: 0, step: 1, maxStaggerLines: 1};
                }
            }

            function createTitle() {
                var format;
                var mode = scope.chart.duration;
                if (mode === 'day') {
                    format = 'LL';
                } else if (mode === 'week') {
                    format = '[S]w/YYYY';
                } else if (mode === 'month') {
                    format = 'MM/YYYY';
                } else if (mode === 'year') {
                    format = 'YYYY';
                }

                var label = scope.chart.type === 'power' ? $translate.instant('loads.chart.subtitle.power') : $translate.instant('loads.chart.subtitle.energy');

                return label + " - " + moment(scope.chart.date).format(format)
            }

            function createTooltipLabel(date) {
                var mode = scope.chart.duration;

                if (scope.chart.type === 'power') {
                    if (mode === 'day') {
                        return moment(date).format('LLL');
                    } else if (mode === 'week') {
                        return moment(date).format('LLL');
                    } else if (mode === 'month') {
                        return moment(date).format('LLL');
                    } else if (mode === 'year') {
                        return moment(date).format('LL');
                    }
                } else {
                    if (mode === 'day') {
                        return moment(date).format('LLL');
                    } else if (mode === 'week') {
                        return moment(date).format('LL');
                    } else if (mode === 'month') {
                        return moment(date).format('LL');
                    } else if (mode === 'year') {
                        return moment(date).format('MMMM YYYY');
                    }
                }
            }

            function createGraph() {
                Highcharts.setOptions({
                    global: {
                        useUTC: false
                    }
                });

                elem.highcharts({
                    title: {
                        text: createTitle()
                    },
                    xAxis: {
                        type: 'datetime',
                        tickInterval: createTickInterval(),
                        dateTimeLabelFormats: createDateTimeLabelFormats(),
                        labels: createLabel()
                    },
                    yAxis: {
                        title: {
                            text: null
                        },
                        labels: {
                            formatter: function () {
                                return (this.value / 1000000) + ' ' + (scope.chart.type === 'power' ? 'MW' : 'MWh');
                            }
                        }
                    },
                    plotOptions: {
                        area: {
                            stacking: 'normal',
                            marker: { enabled:false },
                            events: {
                                // Each serie is duplicated (one for positive values, one for negative). In this
                                // case when the user clicks on the legend we have to change the 2 series
                                legendItemClick: (event) => {
                                let visible = event.target.visible;
                event.target.chart.series
                    .filter((serie) => event.target.name === serie.name)
            .forEach((serie) => visible ? serie.hide() : serie.show());

                return false;
            }
            }
            },
                column: {
                    stacking: 'normal'
                },
                series: {
                    groupPadding: 0.05
                }
            },
                tooltip: {
                    formatter: function () {
                        let total = 0;
                        // For the power chart we have 2 values by point. We need to group them and sum the y value
                        // (all the over properties are equals)
                        let points = Object.values(this.points
                                .reduce((acc, value) => {
                                if (acc && acc[value.series.name]) {
                            acc[value.series.name].y += value.y;
                        }
                    else {
                            acc[value.series.name] = value;
                        }
                        return acc;
                    }, {}));

                        const rows = points
                            .map(point => {
                            total += point.y;
                        return `
                                        <tr>
                                            <td style="min-width:20px" bgcolor="${point.series.color}">&nbsp;</td>
                                            <td>&nbsp;</td>
                                            <td style="text-align: left">${point.series.name}</td>
                                            <td style="text-align: right">${ scope.chart.type === 'power' ? unitFilter(point.y, 'W') : unitFilter(point.y, 'Wh')}</td>
                                        </tr>`;
                    })
                    .reduce((acc, value) => acc.concat(value));

                        return `<table cellpadding="100px" cellspacing="100px">
                                            <tr>
                                                <th colspan="4" style="padding-bottom: 0.5em">${createTooltipLabel(this.x)}</th>
                                            </tr>
                                            ${rows}
                                            <tr>
                                                <td>&nbsp;</td>
                                                <td>&nbsp;</td>
                                                <td style="padding-top: 0.5em">Total</td>
                                                <td style="text-align: right;padding-top: 0.5em">
                                                    ${(scope.chart.type === 'power' ? unitFilter(total, 'W') : unitFilter(total, 'Wh'))}
                                                </td>
                                            </tr>
                                        </table>
                                `;
                    },
                    shared: true,
                        crosshairs: true,
                        useHTML: true
                },
                series: createSeries(scope.chart.type),
                    credits: {
                    enabled: false
                }
            }
            )
                ;
            }

            scope.$watch(() => {
                data: scope.chart.data
            }, createGraph, true);
        }
    };
}
