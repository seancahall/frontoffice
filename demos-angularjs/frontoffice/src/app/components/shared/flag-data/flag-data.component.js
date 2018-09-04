import template from './flag-data.template.html';
import controller from './flag-data.controller';

export default {
    template,
    controller,
    bindings: {
        entityType: '@',
        entityId: '<',
        triggerType: '@?'
    },
};
