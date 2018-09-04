import markets from './markets.component';

/** @ngInject */
function routesConfig($stateProvider) {
    $stateProvider
        .state('app.markets', {
            template: '<markets/>',
            url: '/markets'
        });
}

export default angular.module('LeadEssentialsFO.components.markets', [])
    .component('markets', markets)
    .config(routesConfig)
    .name;
