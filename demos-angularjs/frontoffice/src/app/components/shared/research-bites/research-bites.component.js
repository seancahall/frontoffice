import template from './research-bites.template.html';
import controller from './research-bites.controller';

export default {
    template,
    controller,
    bindings: {
        data: '<'
    },
    require: {
        contentParent: '^content'
    }
};
