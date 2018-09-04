import template from './min-max-fields.template.html';
import controller from './min-max-fields.controller';

export default {
    template,
    controller,
    bindings: {
        elementIndex: '<?',
        elementType: '<?',
        showRemoveButton: '<?',
        data: '<'
    },
    require: {
        filtersParent: '^filtersComponent'
    }
};