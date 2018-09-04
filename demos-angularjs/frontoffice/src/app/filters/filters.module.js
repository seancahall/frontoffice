import angular from 'angular';

import Capitalize from './capitalize.filter';
import AddCommas from './add-commas.filter';
import ThousandsDelimiter from './thousands-delimiter.filter';
import Statistics from './statistics.filter';
import StringToUri from './string-to-uri.filer';

export default angular
    .module('LeadEssentialsFO.filters', [])
    .filter('Capitalize', Capitalize)
    .filter('addCommas', AddCommas)
    .filter('thousandsDelimiter', ThousandsDelimiter)
    .filter('statisticFilter', Statistics)
    .filter('stringToUri', StringToUri)
    .name;
