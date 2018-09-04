class HorizontalLineChartController {
    constructor(Filters) {
        this.Filters = Filters;
    }

    $onInit() {
        this.percentageWidth = this.maxValue ? (this.value * 100 / this.maxValue) : 0;
        if (this.percentageWidth > 0 && this.percentageWidth < 0.6 && this.maxValue > 30) {
            this.percentageWidth = 0.6;
        }

        this.onClickEnabled = angular.isObject(this.filterConfig);
    }

    addRangeToFiltersOnClick(e) {
        if (e) {
            e.stopPropagation();
        }

        if (this.onClickEnabled) {
            this.Filters.addRangeFilter(
                this.filterConfig.filterCategoryName,
                this.filterConfig.filterName,
                this.filterConfig.min,
                this.filterConfig.max,
                'OR'
            );
        }
    }

    excludeRangeToFiltersOnClick(e) {
        if (e) {
            e.stopPropagation();
        }

        if (this.onClickEnabled) {
            this.Filters.addRangeFilter(
                this.filterConfig.filterCategoryName,
                this.filterConfig.filterName,
                this.filterConfig.min,
                this.filterConfig.max,
                'NOT'
            );
        }
    }
}
HorizontalLineChartController.$inject = ['Filters'];

export default HorizontalLineChartController;