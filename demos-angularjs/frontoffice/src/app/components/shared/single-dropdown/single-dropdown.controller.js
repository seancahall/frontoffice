class SingleDropdown {
    constructor($timeout, $rootScope) {
        this.$timeout = $timeout;
        this.$rootScope = $rootScope;
    }

    $onInit() {
        this.isOpened = false;
    }

    $doCheck() {
        if (this.disabled) {
            this.isOpened = false;
        }
    }

    Toggle() {
        if(!this.disabled) {
            this.isOpened = !this.isOpened;
        } else {
            this.isOpened = false;
        }
    }

    SetModel(element) {
        this.ngModel = this.property ? element[this.property] : element;
        this.$timeout(() => {
            if(this.afterSelect) {
                this.afterSelect();
            }
        })
    }

    GetName(ngModel) {
        if (!this.ngModel || (typeof this.ngModel !== 'number' && this.ngModel && !this.ngModel.length)) {
            return this.placeholder;
        }

        let _found = null;
        if (this.property) {
            _found = _.find(this.elements, element => String(element[this.property]) === String(ngModel));
        } else {
            const _model = {};
            _model[this.property] = ngModel;
            _found = _.find(this.elements, _model);
        }

        if (_found) {
            return _found[this.label];
        }
    }

    /**
     * @TODO-LE refactoring: move it to separate class/component created for saved searches (extend this component)
     *
     * @param e
     * @param savedSearch
     */
    removeSavedSearch(e, savedSearch) {
        e.stopPropagation();

        this.$rootScope.$emit('FILTERS_REMOVE_SAVED_SEARCH', savedSearch);
    }
}
SingleDropdown.$inject = ['$timeout', '$rootScope'];

export default SingleDropdown;
