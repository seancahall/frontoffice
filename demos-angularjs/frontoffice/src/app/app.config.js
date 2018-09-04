import en from './translations/en';
import HttpInterceptorProvider from './providers/http-interceptor.provider';

/** @ngInject */
const appConfig = ($httpProvider, $urlRouterProvider, $stateProvider, $locationProvider, $translateProvider, paginationTemplateProvider) => {
    // For any unmatched url
    $urlRouterProvider.otherwise('/');

    // HTML5 mode on
    $locationProvider
        .html5Mode({ enabled: true, requireBase: true });

    // Now set up the app abstract state
    $stateProvider
        .state('app', {
            abstract: true,
            component: 'app',
        });

    // Insert custom http provider
    $httpProvider.interceptors.push(HttpInterceptorProvider);

    /**
     * That directive not supporting compiling components in the fly
     * To make HTML files more clear
     * TODO
     */
    paginationTemplateProvider.setString('<div class="number_item_pagination" style="width: 100%">\n' +
        '\n' +
        '    <ul style="width: 100%" class="paginations" ng-if="1 < pages.length || !autoHide">\n' +
        '        <li class="text_pagination_item prev_item_pagination" flex="20" ng-if="directionLinks" ng-class="{ disabled : pagination.current == 1 }">\n' +
        '            <a href="" ng-click="setCurrent(pagination.current - 1)"> <i class="fa fa-chevron-left"\n' +
        '                                                                      ></i>\n' +
        '                Back\n' +
        '            </a>\n' +
        '        </li>\n' +
        '        <ul>\n' +
        '            <li class="item_page_number" ng-repeat="pageNumber in pages track by tracker(pageNumber, $index)"\n' +
        '                ng-class="{ active : pagination.current == pageNumber, disabled : pageNumber == \'...\' }">\n' +
        '                <a href="" ng-click="setCurrent(pageNumber)">{{ pageNumber }}</a>\n' +
        '            </li>\n' +
        '        </ul>\n' +
        '\n' +
        '        <form class="custom-pager-form">\n' +
        '            <ul>\n' +
        '                <li class="label">Page</li>\n' +
        '                <li class="input"><input ng-model="pagination.current" type="number" size="5" /></li>\n' +
        '                <li class="button"><button ng-click="setCurrent(pagination.current)">go</button></li>\n' +
        '                <li class="info">of&nbsp;{{pagination.last}}</li>\n' +
        '            </ul>\n' +
        '        </form>\n' +
        '\n' +
        '        <li class="text_pagination_item next_item_pagination" flex="20" ng-if="directionLinks" ng-class="{ disabled : pagination.current == pagination.last }">\n' +
        '            <a href="" ng-click="setCurrent(pagination.current + 1)">Next <i class="fa fa-chevron-right"\n' +
        '                                                                          ></i></a>\n' +
        '        </li>\n' +
        '    </ul>\n' +
        '</div>');

    $translateProvider.translations('en', en);
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escape');
};

export default appConfig;
