/** @ngInject */
function routesConfig($stateProvider) {
    $stateProvider
        .state('app.contentDetails', {
            template: '<content/>',
            url: '/content/:id'
        });
}

export default angular.module('LeadEssentialsFO.components.contentDetails', [])
    .config(routesConfig)
    .name;
