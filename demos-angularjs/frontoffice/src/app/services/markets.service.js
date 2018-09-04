class Markets {
    constructor(Rest) {
        this.Rest = Rest;
    }

    GetAccountIndustries(filters) {
        return this.Rest.Post(
            '/api/markets/enterprise/industries',
            this.prepareFiltersForMarketsCall(filters)
        );
    }

    GetAccountEmployees(filters) {
        return this.Rest.Post(
            '/api/markets/enterprise/employees',
            this.prepareFiltersForMarketsCall(filters)
        );
    }

    GetAccountItBudget(filters) {
        return this.Rest.Post(
            '/api/markets/enterprise/itbudget',
            this.prepareFiltersForMarketsCall(filters)
        );
    }

    GetAccountRevenue(filters) {
        return this.Rest.Post(
            '/api/markets/enterprise/revenue',
            this.prepareFiltersForMarketsCall(filters)
        );
    }

    GetSiteIndustries(filters) {
        return this.Rest.Post(
            '/api/markets/site/industries',
            this.prepareFiltersForMarketsCall(filters)
        );
    }

    GetSiteEmployees(filters) {
        return this.Rest.Post(
            '/api/markets/site/employees',
            this.prepareFiltersForMarketsCall(filters)
        );
    }

    GetSiteItbudget(filters) {
        return this.Rest.Post(
            '/api/markets/site/itbudget',
            this.prepareFiltersForMarketsCall(filters)
        );
    }

    GetSiteRevenue(filters) {
        return this.Rest.Post(
            '/api/markets/site/revenue',
            this.prepareFiltersForMarketsCall(filters)
        );
    }

    getInitialGeoZoom(market, _search) {
        return this.Rest.Post(
            '/api/markets/' + market + '/InitialGeoZoom',
            this.prepareFiltersForMarketsCall(_search)
        );
    }

    /**
     * All api/markets/* calls does not use the paging nor order
     * if present, it needs to be removed
     *
     * @param builtFilters
     * @return {*}
     */
    prepareFiltersForMarketsCall(builtFilters) {
        const preparedFilters = _.cloneDeep(builtFilters);

        if(preparedFilters.paging) {
            delete preparedFilters.paging;
        }

        if(preparedFilters.order) {
            delete preparedFilters.order;
        }

        return preparedFilters;
    }
}
Markets.$inject = ['Rest'];

export default Markets;