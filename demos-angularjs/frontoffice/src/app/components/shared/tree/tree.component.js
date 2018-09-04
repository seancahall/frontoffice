import template from './tree.template.html';
import controller from './tree.controller';

export default {
    template,
    controller,
    bindings: {
        data: '<',
        loading: '<',
        expand: '&',
        toggle: '&'
    }
};
