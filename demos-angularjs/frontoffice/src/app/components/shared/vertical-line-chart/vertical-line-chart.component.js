import template from './vertical-line-chart.template.html';
import controller from './vertical-line-chart.controller';

export default {
    template,
    controller,
    bindings: {
        maxValue: '<',
        label: '<',
        value: '<',
        tooltipScope: '<',
        filterConfig: '<',
        chartId: '<',
        elementsCount: '<',
        containerId: '<'
    }
};
