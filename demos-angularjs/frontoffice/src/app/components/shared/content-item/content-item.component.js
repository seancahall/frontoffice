import template from './content-item.template.html';
import controller from './content-item.controller';

export default {
    template,
    controller,
    bindings: {
        data: '<'
    },
    require: {
        researchBitesParent: '^researchBitesComponent'
    }
};
