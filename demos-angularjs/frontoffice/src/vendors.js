import uiRouter from '@uirouter/angularjs';
import uiBootstrap from 'angular-ui-bootstrap';
import angularLoadingBar from 'angular-loading-bar';
import angularTranslate from 'angular-translate';
import angularMaterial from 'angular-material';
import $cookies from 'angular-cookies';
import deviceDetector from 'ng-device-detector';
import ngStorage from 'ngstorage';
import dirPagination from 'angular-utils-pagination';
import uiSelect from 'ui-select';
import infiniteScroll from 'ng-infinite-scroll';
import ngClipboard from 'ngclipboard';
import ngFileUpload from 'ng-file-upload';
import ngMessages from 'angular-messages';
import ngSanitize from 'angular-sanitize';

import 'angularjs-dropdown-multiselect';
import 'angular-chart.js';

export default [
    uiRouter,
    uiBootstrap,
    angularLoadingBar,
    angularTranslate,
    angularMaterial,
    $cookies,
    deviceDetector,
    ngStorage.name,
    dirPagination,
    uiSelect,
    infiniteScroll,
    ngClipboard,
    ngFileUpload,
    ngMessages,
    ngSanitize,
    'angularjs-dropdown-multiselect',
    'chart.js'
];
