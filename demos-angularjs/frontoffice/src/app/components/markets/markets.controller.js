class Markets {
    constructor($rootScope, $window, Markets, $log, Filters, AppHelper, SelectSearchResults) {
        this.$rootScope = $rootScope;
        this.$window = $window;
        this.Markets = Markets;
        this.$log = $log;
        this.Filters = Filters;
        this.AppHelper = AppHelper;
        this.SelectSearchResults = SelectSearchResults;

        this.stateScreen = this.stateScreen.bind(this);
    }

    $onInit() {
        /** Definitions **/
        this._visibleTab = 'enterprise';
        this.loading = false;
        this.pageSize = 25;

        /**
         * apply default filters set for company
         * for now only markets are applied
         */
        this.Filters.ApplyDefaultFilters();

        /**
         * Apply filters if stored into local storage
         */
        this.Filters.ApplyStoredFilters();

        /**
         * @TODO-LE to be removed after API responses will be updated (VERSION4-3428 VERSION4-3429)
         * config for 'Account employee distribution' and 'Site employee distribution'
         */
        this.employeeDistributionRanges = [
            { label: '10000+', min: '10000' },
            { label: '5000 to 9999', min: '5000', max: '9999' },
            { label: '2500 to 4999', min: '2500', max: '4999' },
            { label: '1000 to 2499', min: '1000', max: '2499' },
            { label: '500+', min: '500' },
            { label: '500 to 999', min: '500', max: '999' },
            { label: '250 to 499', min: '250', max: '499' },
            { label: '100 to 249', min: '100', max: '249' },
            { label: '50 to 99', min: '50', max: '99' },
            { label: '20 to 99', min: '20', max: '99' },
            { label: '6 to 19', min: '6', max: '19' },
            { label: '1 to 5', min: '1', max: '5' },
            { label: '0 to 49', min: '0', max: '49' },
            { label: 'Unspecified' },
            { label: 'Unknown' }
        ];

        /**
         * @TODO-LE to be removed after API responses will be updated (VERSION4-3428 VERSION4-3429)
         * config for 'Account revenue distribution' and 'Site revenue distribution'
         */
        this.revenueDistributionRanges = [
            { label: '>$5B', min: '5000000001' },
            { label: '$2.5B to 4.99B', min: '2500000000', max: '4990000000' },
            { label: '$1B to 2.49B', min: '1000000000', max: '2490000000' },
            { label: '$500M to 999M', min: '500000000', max: '999000000' },
            { label: '$250M to $499M', min: '250000000', max: '499000000' },
            { label: '$100M to $249M', min: '100000000', max: '249000000' },
            { label: '$50M to $99M', min: '50000000', max: '99000000' },
            { label: '$25M TO $49M', min: '25000000', max: '49000000' },
            { label: '$0M TO $24M', min: '0', max: '24000000' },
            { label: '<$49M', max: '48999999' },
            { label: 'Unspecified' },
            { label: 'Unknown' }
        ];

        /**
         * @TODO-LE to be removed after API responses will be updated (VERSION4-3428 VERSION4-3429)
         * config for 'Account budget distribution' and 'Site budget distribution'
         */
        this.budgetDistributionConfig = [
            { label: '$500k+', min: '500000' },
            { label: '$250k to $499k', min: '250000', max: '499000' },
            { label: '$100k to $249k', min: '100000', max: '249000' },
            { label: '$50k to $99k', min: '50000', max: '99000' },
            { label: '$25k to $49k', min: '25000', max: '49000' },
            { label: '<$25k', max: '24999' },
            { label: 'Unspecified' },
            { label: 'Unknown' }
        ];

        /**
         * Get filters
         * To be available on view before do something
         */
        this._filters = this.Filters.BuildFiltersToSend();

        this._filtersOptionsLoadedForEnterprise = this.Filters.GetFilterOptions('enterprise', 'industryIds').options.length > 0;
        this._filtersOptionsLoadedForSite = this.Filters.GetFilterOptions('site', 'industryIds').options.length > 0;
        this._accountIndustriesTotal = 0;
        this._siteIndustriesTotal = 0;

        const _this = this;

        /**
         * watch options - options need to be loaded to make possible setting filters by click for industries
         */
        if (!this._filtersOptionsLoadedForEnterprise || !this._filtersOptionsLoadedForSite) {
            // set options pre-load
            this.Filters.addFilterToPreLoadOptionsQueue('enterprise', 'industryIds');
            this.Filters.addFilterToPreLoadOptionsQueue('site', 'industryIds');
            this.Filters.addFilterToPreLoadOptionsQueue('location', 'countryIds');
            this.Filters.addFilterToPreLoadOptionsQueue('enterprise', 'countryIds');
            this.Filters.addFilterToPreLoadOptionsQueue('location', 'stateIds');

            this.$rootScope.$emit('FILTERS_PRE_LOAD_OPTIONS');

            this.unsubscribeFiltersOptionsLoaded = this.$rootScope.$on(
                'FILTERS_OPTIONS_LOADED',
                (event, filterCategoryName, filterName) => {
                    if (filterCategoryName === 'enterprise' && filterName === 'industryIds') {
                        _this._filtersOptionsLoadedForEnterprise = true;
                        angular.forEach(_this.accountIndustries, summary => summary.filterConfig.enabled = true);
                    } else if (filterCategoryName === 'site' && filterName === 'industryIds') {
                        _this._filtersOptionsLoadedForSite = true;
                        angular.forEach(_this.siteIndustries, summary => summary.filterConfig.enabled = true);
                    }
                }
            );
        } else {
            this.unsubscribeFiltersOptionsLoaded = angular.noop;
        }

        /**
         * UPDATE_FILTERS Listener
         * It will refresh everything which is needed on that page
         * It will be fired when users hit 'Update Results' button in filter section
         */
        this.unsubscribeUpdateFilters = this.$rootScope.$on('UPDATE_FILTERS', (event, filters) => {
            this.GetAccountIndustries(filters);
            this.GetAccountEmployees(filters);
            this.GetAccountItBudget(filters);
            this.GetAccountRevenue(filters);

            this.GetSiteIndustries(filters);
            this.GetSiteEmployees(filters);
            this.GetSiteItbudget(filters);
            this.GetSiteRevenue(filters);
            this.$rootScope.$emit('UPDATE_COUNTS');
            this.$rootScope.$emit('UPDATE_CHARTS');
        });

        this.GetAccountIndustries(this._filters);
        this.GetAccountEmployees(this._filters);
        this.GetAccountItBudget(this._filters);
        this.GetAccountRevenue(this._filters);

        this.GetSiteIndustries(this._filters);
        this.GetSiteEmployees(this._filters);
        this.GetSiteItbudget(this._filters);
        this.GetSiteRevenue(this._filters);

        this.unsubscribeCollapseSearchPanel = this.$rootScope.$on('COLLAPSE_SEARCH_PANEL', () => this.showHorizontalSearch = false);

        this.stateScreen();
        $(this.$window)
            .off('resize', this.stateScreen)
            .on('resize', this.stateScreen);
    }

    $onDestroy() {
        this.unsubscribeFiltersOptionsLoaded();
        this.unsubscribeUpdateFilters();
        this.unsubscribeCollapseSearchPanel();

        this.$rootScope.$$listeners.CHECK_IF_MESSAGE_SHOULD_BE_VISIBLE = [];

        $(this.$window).off('resize', this.stateScreen);
    }

    Showtab(tab) {
        this._visibleTab = tab;
        this._setResultsFound();
        this.$rootScope.$emit('MARKET_CHANGED', tab);
    }

    IsTabVisible(tab) {
        return this._visibleTab === tab;
    }

    _setResultsFound() {
        if (this._visibleTab === 'enterprise') {
            this.Filters.SetTotalResults(this._accountIndustriesTotal);
        } else {
            this.Filters.SetTotalResults(this._siteIndustriesTotal);
        }
    }

    /**
     * Returns ordered data with settings needed to set the filters (on click)
     * and config for tooltips
     *
     * @param rawData {Array}
     * @param filterCategoryName {String}
     * @param filterName {String}
     * @param entityName {String}
     * @private
     */
    _getPreparedDataForIndustriesSection(rawData, filterCategoryName, filterName, entityName) {
        const _tmpFitlerEnabled = filterCategoryName === 'enterprise' ? this._filtersOptionsLoadedForEnterprise : this._filtersOptionsLoadedForSite;

        return rawData.map(
            (summary, index) => {
                summary.tooltipScope = {
                    industryName: summary.entity,
                    entityName: entityName,
                    count: summary.count,
                    distribution: summary.distribution,
                };

                summary.filterConfig = {
                    filterCategoryName: filterCategoryName,
                    filterName: filterName,
                    value: summary.entity,
                    enabled: _tmpFitlerEnabled
                };

                summary.chartId = `industries${entityName}${index}`;

                return summary;
            }
        );
    }

    _getMaxValue(rowset) {
        return rowset.reduce(
            (a, summary) => {
                if (summary.distribution > a) {
                    a = summary.distribution;
                }
                return a;
            },
            0
        );
    }

    /**
     * Returns ordered data with settings needed to set the filters (on click)
     * and config for tooltips
     *
     * @param rawData {Array}
     * @param orderedRanges {Object}
     * @param filterCategoryName {String}
     * @param filterName {String}
     * @param tooltipPhrases {Object}
     * @return {Array}
     * @private
     */
    _getPreparedDataForDistributionSection(rawData, orderedRanges, filterCategoryName, filterName, tooltipPhrases) {
        const orderedData = [];

        const rawDataMapped = {};
        rawData.map(item => rawDataMapped[item.entity] = item);

        orderedRanges.map((range, index) => {
            if (rawDataMapped[range.label]) {
                rawDataMapped[range.label].tooltipScope = {
                    ...tooltipPhrases,
                    rangeLabel: range.label,
                    count: rawDataMapped[range.label].count,
                    distribution: rawDataMapped[range.label].distribution
                };

                if (range.label !== 'Unknown' && range.label !== 'Unspecified') {
                    rawDataMapped[range.label].filterConfig = {
                        min: range.min ? range.min : null,
                        max: range.max ? range.max : null,
                        filterCategoryName: filterCategoryName,
                        filterName: filterName
                    };
                }

                rawDataMapped[range.label].chartId = `dist${filterCategoryName}${filterName}${index}`;

                orderedData.push(rawDataMapped[range.label]);
            }
        });

        return orderedData;
    }

    GetAccountIndustries(filters) {
        this.loading = true;
        this.Markets.GetAccountIndustries(filters).then(
            (accountIndustries) => {

                /**
                 * VERSION4-3274
                 * Check before assign
                 */
                if(this.Filters.CheckForSelectSearchResults(accountIndustries.data.summaries)) {
                    this.SelectSearchResults.ShowModal();
                }

                if (angular.isArray(accountIndustries.data.summaries) && accountIndustries.data.summaries.length) {
                    this._accountIndustriesTotal = accountIndustries.data.total;

                    this.accountIndustries = this._getPreparedDataForIndustriesSection(
                        accountIndustries.data.summaries,
                        'enterprise',
                        'industryIds',
                        'Account'
                    );

                    this.accountIndustriesMaxValue = this._getMaxValue(this.accountIndustries);
                } else {
                    this._accountIndustriesTotal = 0;
                    this.accountIndustries = [];
                    this.accountIndustriesMaxValue = 0;
                }

                this._setResultsFound();

                this.loading = false;

                // Check if additional message should be visible
                this.$rootScope.$emit('CHECK_IF_MESSAGE_SHOULD_BE_VISIBLE');
            }, (error) => {
                this.$log.error(error);
                this.loading = false;
            }
        );
    }

    GetAccountEmployees(filters) {
        this.loading = true;
        this.Markets.GetAccountEmployees(filters).then(
            (accountEmployees) => {
                this.accountEmployees = this._getPreparedDataForDistributionSection(
                    accountEmployees.data.summaries,
                    this.employeeDistributionRanges,
                    'enterprise',
                    'employees',
                    {
                        title: 'Account employee distribution',
                        entityName: 'Account'
                    }
                );
                this.accountEmployeesMaxValue = this._getMaxValue(this.accountEmployees);
                this.loading = false;

                // Check if additional message should be visible
                this.$rootScope.$emit('CHECK_IF_MESSAGE_SHOULD_BE_VISIBLE');
            }, (error) => {
                this.$log.error(error);
                this.loading = false;
            }
        );
    }

    GetAccountItBudget(filters) {
        this.loading = true;
        this.Markets.GetAccountItBudget(filters).then(
            (accountItBudget) => {
                this.accountItBudget = this._getPreparedDataForDistributionSection(
                    accountItBudget.data.summaries,
                    this.budgetDistributionConfig,
                    'enterprise',
                    'itBudget',
                    {
                        title: 'Account budget distribution',
                        entityName: 'Account'
                    }
                );

                this.accountItBudgetMaxValue = this._getMaxValue(this.accountItBudget);
                this.loading = false;

                // Check if additional message should be visible
                this.$rootScope.$emit('CHECK_IF_MESSAGE_SHOULD_BE_VISIBLE');
            }, (error) => {
                this.$log.error(error);
                this.loading = false;
            }
        );
    }

    GetAccountRevenue(filters) {
        this.loading = true;
        this.Markets.GetAccountRevenue(filters).then(
            (accountRevenue) => {
                this.accountRevenue = this._getPreparedDataForDistributionSection(
                    accountRevenue.data.summaries,
                    this.revenueDistributionRanges,
                    'enterprise',
                    'revenues',
                    {
                        title: 'Account revenue distribution',
                        entityName: 'Account'
                    }
                );

                this.accountRevenueMaxValue = this._getMaxValue(this.accountRevenue);
                this.loading = false;

                // Check if additional message should be visible
                this.$rootScope.$emit('CHECK_IF_MESSAGE_SHOULD_BE_VISIBLE');
            }, (error) => {
                this.$log.error(error);
                this.loading = false;
            }
        );
    }

    GetSiteIndustries(filters) {
        this.loading = true;
        this.Markets.GetSiteIndustries(filters).then(
            (site) => {
                if (angular.isArray(site.data.summaries) && site.data.summaries.length) {
                    this._siteIndustriesTotal = site.data.total;

                    this.siteIndustries = this._getPreparedDataForIndustriesSection(
                        site.data.summaries,
                        'site',
                        'industryIds',
                        'Site'
                    );

                    this.siteIndustriesMaxValue = this._getMaxValue(this.siteIndustries);
                } else {
                    this._siteIndustriesTotal = 0;
                    this.siteIndustries = [];
                    this.siteIndustriesMaxValue = 0;
                }
                this._setResultsFound();
                this.loading = false;

                // Check if additional message should be visible
                this.$rootScope.$emit('CHECK_IF_MESSAGE_SHOULD_BE_VISIBLE');
            }, (error) => {
                this.$log.error(error);
                this.loading = false;
            }
        );
    }

    GetSiteEmployees(filters) {
        this.loading = true;
        this.Markets.GetSiteEmployees(filters).then(
            (site) => {
                this.siteEmployees = this._getPreparedDataForDistributionSection(
                    site.data.summaries,
                    this.employeeDistributionRanges,
                    'site',
                    'employees',
                    {
                        title: 'Site employee distribution',
                        entityName: 'Site'
                    }
                );
                this.siteEmployeesMaxValue = this._getMaxValue(this.siteEmployees);
                this.loading = false;

                // Check if additional message should be visible
                this.$rootScope.$emit('CHECK_IF_MESSAGE_SHOULD_BE_VISIBLE');
            }, (error) => {
                this.$log.error(error);
                this.loading = false;
            }
        );
    }

    GetSiteItbudget(filters) {
        this.loading = true;
        this.Markets.GetSiteItbudget(filters).then(
            (site) => {
                this.siteItbudget = this._getPreparedDataForDistributionSection(
                    site.data.summaries,
                    this.budgetDistributionConfig,
                    'site',
                    'itBudget',
                    {
                        title: 'Site budget distribution',
                        entityName: 'Site'
                    }
                );
                this.siteItBudgetMaxValue = this._getMaxValue(this.siteItbudget);
                this.loading = false;

                // Check if additional message should be visible
                this.$rootScope.$emit('CHECK_IF_MESSAGE_SHOULD_BE_VISIBLE');
            }, (error) => {
                this.$log.error(error);
                this.loading = false;
            }
        );
    }

    GetSiteRevenue(filters) {
        this.loading = true;
        this.Markets.GetSiteRevenue(filters).then(
            (site) => {
                this.siteRevenuse = this._getPreparedDataForDistributionSection(
                    site.data.summaries,
                    this.revenueDistributionRanges,
                    'site',
                    'revenues',
                    {
                        title: 'Site revenue distribution',
                        entityName: 'Site'
                    }
                );
                this.siteRevenueMaxValue = this._getMaxValue(this.siteRevenuse);
                this.loading = false;

                // Check if additional message should be visible
                this.$rootScope.$emit('CHECK_IF_MESSAGE_SHOULD_BE_VISIBLE');
            }, (error) => {
                this.$log.error(error);
                this.loading = false;
            }
        );
    }

    /**
     * control filters visibility according to screen width
     */
    searchHorizontalChangeState() {
        this.showHorizontalSearch = !this.showHorizontalSearch;
    }
    stateScreen() {
        this.AppHelper.stateScreen(this);
    }
}
Markets.$inject = ['$rootScope', '$window', 'Markets', '$log', 'Filters', 'AppHelper', 'SelectSearchResults'];

export default Markets;
