class CountsController {
    constructor($rootScope, $scope, Counts, Filters) {
        this.$rootScope = $rootScope;
        this.Counts = Counts;
        this.Filters = Filters;
    }

    $onInit() {
        /**
         * Get initial counts for view
         * @type {void|*}
         */
        this.counts = this.Counts.GetCounts();

        /**
         * Do what is needed when component initialized
         * In that case that is connected with VERSION4-3366
         * Initial call is needed only one time
         */
        if(!this.Counts.IsInitialCallDone()) {
            this.Counts.SetLoadingStatus(false);
            this.GetCounts();
            this.Counts.SetInitialCallDone();
        }

        /**
         * Listener
         * When UPDATE_COUNTS event will be emitted
         * Load new counts
         */
        this.unregisterUpdateCountsListener = this.$rootScope.$on('UPDATE_COUNTS', () => {
            this.GetCounts();
        });

        /**
         * Listener
         * When COUNTS_UPDATED event will be emitted
         * Bind values to local
         */
        this.unregisterCountsUpdatedListener = this.$rootScope.$on('COUNTS_UPDATED', (event, counts) => {
            this.counts = counts;
        });
    }

    $onDestroy() {
        this.unregisterUpdateCountsListener();
        this.unregisterCountsUpdatedListener();
    }

    GetCounts() {
        // Get counts
        // Use filters parameters
        let _filters = this.Filters.BuildFiltersToSend();

        // Get counters and save it into service
        this.Counts.Load(_filters);
    }

    getClass() {
        return this.additionalClass;
    }

    isLoading() {
        return this.Counts.IsLoading();
    }

}
CountsController.$inject = ['$rootScope', '$scope', 'Counts', 'Filters'];

export default CountsController;