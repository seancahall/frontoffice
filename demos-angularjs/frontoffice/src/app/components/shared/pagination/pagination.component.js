import template from './pagination.template.html';
import controller from './pagination.controller';

export default {
    template,
    controller,
    bindings: {
        onPageChange: '<',
    }
};

