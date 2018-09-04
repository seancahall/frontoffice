import template from './integrations-export-indicator.template.html';
import controller from './integrations-export-indicator.controller';

export default {
    template,
    controller,
    bindings: {
        externalSystems: '<',
        entityId: '<'
    }
};
