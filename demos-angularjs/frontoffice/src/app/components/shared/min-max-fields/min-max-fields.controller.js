class MinMaxFieldsController {
    /** @ngInject */
    constructor(AppHelper, Filters) {
        this.AppHelper = AppHelper;
        this.Filters = Filters;

        this.model = {
            min: null,
            max: null
        };
    }

    $onInit() {
        this.options = this.Filters.GetFiltersOptions();

        if (!this.data) {
            this.category = '';
            this.filter = '';
            this.elementGlobalIndex = '';
            this.label = '';
            this.searchParamOperator = 'OR';
        } else {
            this.category = this.data.category;
            this.filter = this.data.filter;
            this.elementGlobalIndex = this.data.elementGlobalIndex;
            this.searchParamOperator = this.data.searchParamOperator === 'NOT' ? 'NOT' : 'OR';

            // prepare placeholders
            this.placeholders = {
                min: this.options[this.category][this.filter].min.placeholder,
                max: this.options[this.category][this.filter].max.placeholder
            };
        }
    }

    $doCheck() {
        if (this.data) {
            this.label = this.data.label;

            if (this.data.values) {
                if (this.Filters.isRangeValue(this.data.values.min)) {
                    // avoid reference here
                    this.model.min = `${this.data.values.min}`;
                } else {
                    this.model.min = null;
                }

                if (this.Filters.isRangeValue(this.data.values.max)) {
                    // avoid reference here
                    this.model.max = `${this.data.values.max}`;
                } else {
                    this.model.max = null;
                }

            }

            if (this.data.searchParamOperator) {
                this.searchParamOperator = this.data.searchParamOperator === 'NOT' ? 'NOT' : 'OR';
            }
        }
    }

    preventNotNumericInput(event) {
        this.AppHelper.preventNotNumericInput(event);
    }

    isInputGreaterThan() {
        return this.AppHelper.isGreaterThan(this.model.min, this.model.max);
    }

    removeElement() {
        this.filtersParent.removeRangeFieldsElement(
            this.category,
            this.filter,
            this.elementGlobalIndex
        );
    }

    updateParentModel(range) {
        let value = this.model[range];

        if (!value) {
            value = '';
        }

        if (this.data && this.data.values) {
            this.data.values[range] = value;
        }

        this.filtersParent.updateRangesModel({
            category: this.category,
            filter: this.filter,
            elementType: this.elementType,
            range, // 'min' or 'max'
            value,
            elementIndex: this.elementIndex,
            elementGlobalIndex: this.elementGlobalIndex,
            searchParamOperator: this.searchParamOperator
        });
    }
}

export default MinMaxFieldsController;
