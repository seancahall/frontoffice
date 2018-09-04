import angular from 'angular';

import vendors from './vendors';

import config from './app/app.config';
import run from './app/app.run';

import appComponent from './app/app.component';
import servicesModule from './app/services/services.module';
import factoriesModule from './app/factories/factories.module';
import directivesModule from './app/directives/directives.module';
import filtersModule from './app/filters/filters.module'
import componentsModule from './app/components/components.module';

import './index.scss';

const appDependencies = [
    filtersModule,
    servicesModule,
    factoriesModule,
    directivesModule,
    componentsModule
];

angular
    .module('LeadEssentialsFO', vendors.concat(appDependencies))
    .config(config)
    .run(run)
    .component('app', appComponent);

