import template from './horizontal-line-chart.template.html';
import controller from './horizontal-line-chart.controller';

export default {
    template,
    controller,
    bindings: {
        label: '<',
        value: '<',
        tooltipScope: '<',
        maxValue: '<',
        // config for filter to set on click
        filterConfig: '<',
        chartId: '<'
    },
}
