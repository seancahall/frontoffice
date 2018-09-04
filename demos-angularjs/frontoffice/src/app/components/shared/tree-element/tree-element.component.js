import template from './tree-element.template.html';
import controller from './tree-element.controller';

export default {
    template,
    controller,
    bindings: {
        category: '<',
        expand: '&',
        toggle: '&'
    }
};
