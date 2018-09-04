import content from './content.component';

/** @ngInject */
function routesConfig($stateProvider) {
    $stateProvider
        .state('app.content', {
            template: '<content/>',
            url: '/content'
        })
        .state('app.content.id', {
            url: "/:id"
        })
}

export default angular.module('LeadEssentialsFO.components.content', [])
    .component('content', content)
    .config(routesConfig)
    .name;
