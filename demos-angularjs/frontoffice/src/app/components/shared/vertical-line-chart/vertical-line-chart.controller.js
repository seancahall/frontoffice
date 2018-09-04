class VerticalLineChartController {
    constructor(Filters) {
        this.Filters = Filters;
    }

    $onInit() {
        this.containerElement = null;
        this.availableSectionViewportWidth = 0;
        this.elementWidth = 0;
        this.maxElementWidth = 0;
        this.labelHolderWidth = 0;
        this.labelWidth = 0;

        this.percentageHeight = this.maxValue ? (this.value * 100 / this.maxValue) : 0;

        if (this.label.length > 20) {
            this.label = this.label.substr(0, 22).replace(/^\s+$/g, '')  + '...';
        }
    }

    setLabelPositionAndGetElementWidth() {
        this.containerElement = $('#' + this.containerId);
        this.availableSectionViewportWidth = this.containerElement.width() - 10;
        if (this.availableSectionViewportWidth < 200) {
            this.availableSectionViewportWidth = 200;
        }

        this.elementWidth = this.availableSectionViewportWidth / this.elementsCount;
        this.maxElementWidth = this.availableSectionViewportWidth / 20;
        if (this.elementWidth > this.maxElementWidth) {
            this.elementWidth = this.maxElementWidth;
        }

        // labels positioning
        this.labelHolderWidth = this.containerElement.find('.vertical-line-chart__label-holder').width();
        this.labelWidth = this.containerElement.find('.vertical-line-chart__label span').height();
        this.containerElement.find('.vertical-line-chart__label').height(this.labelHolderWidth);
        this.containerElement.find('.vertical-line-chart__label span').css('top', ((this.labelHolderWidth - this.labelWidth) / 2) + 'px');

        return this.elementWidth;
    }

    filterOnClick(e) {
        if (e) {
            e.stopPropagation();
        }

        if (!this.filterConfig.enabled) {
            return;
        }

        this.Filters.updateMultiSelectFilter(
            this.filterConfig.filterCategoryName,
            this.filterConfig.filterName,
            'name',
            this.filterConfig.value,
            true,
            true
        );
    }
}
VerticalLineChartController.$inject = ['Filters'];

export default VerticalLineChartController;