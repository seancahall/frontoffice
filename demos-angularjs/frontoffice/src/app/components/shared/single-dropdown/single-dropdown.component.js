import template from './single-dropdown.template.html';
import controller from './single-dropdown.controller';

export default {
    template,
    controller,
    bindings: {
        placeholder: '<',
        ngModel: '=',
        elements: '<',
        property: '@',
        label: '@',
        disabled: '=',
        afterSelect: '&',
        filterName: '<?'
    }
};
