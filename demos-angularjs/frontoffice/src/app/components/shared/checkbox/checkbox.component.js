import template from './checkbox.template.html';
import controller from './checkbox.controller';

export default {
    template,
    controller,
    bindings: {
        checked: '<'
    }
};
