class FiltersController {
    /** @ngInject */
    constructor($rootScope, $log, $state, Filters, Cache, Lookup, AppHelper, NutsCodes, GetFiltersJSON, SelectSearchResults) {
        this.$rootScope = $rootScope;
        this.$log = $log;
        this.$state = $state;
        this.Filters = Filters;
        this.Cache = Cache;
        this.Lookup = Lookup;
        this.AppHelper = AppHelper;
        this.NutsCodes = NutsCodes;
        this.GetFiltersJSON = GetFiltersJSON;
        this.SelectSearchResults = SelectSearchResults;

        this._resetAllRangeElements = this._resetAllRangeElements.bind(this);

        /**
         * Object contains every settings for multiselect dropdowns
         * @template {String} - Contains template
         * @showUncheckAll {Boolean} - Show uncheck all option at the top
         * @showCheckAll {Boolean} - Show check all option at the top
         * @scrollable {Boolean} - Scrollable content
         */
        this.Settings =  {
            template: `<p ng-if="option && option.separatorLine" class="multiselect-options-separator-line">&nbsp;</p><p class="label">{{ option.name }}</p>`,
            showUncheckAll: false,
            showCheckAll: false,
            scrollable: true
        };
    }

    $doCheck() {
        this.Filters.UpdateFiltersBy(this.Model);
        this.disableLocationSearchType = !this.Model.location.cities.length && !this.Model.location.zipCodes.length && !this.Model.location.metros.length && !this.Model.location.stateIds.length && !this.Model.location.countryIds.length && !this.Model.location.continentIds.length && !this.Model.location.nutsCodes.length;
    }

    resetLocationSearchTypeDropdown() {
        const l = this.Model.location;
        if(!l.cities.length && !l.zipCodes.length && !l.metros.length && !l.stateIds.length && !l.countryIds.length && !l.continentIds.length && !l.nutsCodes.length){
            this.Model.location.locationRuleId = [];
            this.SetFilterOptions(
                'location',
                'locationRuleId',
                this.Filters.GetFilterOptions('location', 'locationRuleId').options
            )
        }
    }

    $onInit() {
        /**
         * Definitions
         */
        this._toggle = {};

        // Key codes available: 'Enter, Comma, Tab
        this._keyCodesToEnter = [13, 188, 9];

        // min max fields settings
        this.rangeDropdownsGroups = {
            cp: [],
            enterprise: [],
            site: []
        };

        this.rangeDropdownEnabled = {
            enterprise: true,
            site: true,
            cp: true
        };

        this.selectedItem = {
            enterprise: {},
            site: {},
            cp: {}
        };

        this.filtersOptions = this.Filters.GetFiltersOptions();

        const _this = this;

        /**
         * VERSION4-3070
         * flag to control nuts code removing
         */
        this._clearNutsCodeProcessing = false;

        this.Model = this.Filters.Get();

        this.eventsFactoryInstances = {};

        /**
         * prepare range (min-max) fields element
         */
        this._resetAllRangeElements();
        this._initRangeElementsFromCurrentFilters();

        this.Cache.clearLookup('savedSearches');

        /**
         * Moved from previous filters
         * TODO - Need to be refactored
         */
        this.unsubscribeInsertIndustries = this.$rootScope.$on('INSERT_INDUSTRIES', (event, value, category) => {
            let _industryOptions = _this.Filters.GetFilterOptions(category, 'industryIds').options;
            let _found = _.find(_this.Model[category].industryIds, industry => {
                return +industry.id === +value.id;
            });
            if (!_found) {
                let _elementToPush = _.find(_industryOptions, industry => {
                    return +industry.id === +value.id;
                });
                _this.Model[category].industryIds.push(_elementToPush);
            }

            // include 'All' option if all industries are selected and 'All' options is not in the model YET
            let _allOptionSeleted = _.find(
                this.Model[category].industryIds,
                selectedIndustry => {
                    if (selectedIndustry) {
                        return +selectedIndustry.id === -1;
                    }
                    return false;
                }
            );
            if (!_allOptionSeleted && _this.Model[category].industryIds.length === (_industryOptions.length - 1)) {
                let _allOptionToPush = _.find(
                    _industryOptions,
                    industry => +industry.id === -1
                );
                if (_allOptionToPush) {
                    _this.Model[category].industryIds.push(_allOptionToPush);
                }
            }
        });

        this.unsubscribeRemoveIndustries = this.$rootScope.$on('REMOVE_INDUSTRIES', (event, value, category) => {
            /**
             * remove the unselected item from model
             * remove also option 'All' is it is present in model
             * option 'All' must be unselected if at least one industry is unselected
             * ('All' => -1)
             */
            [value.id, -1].forEach(_itemId => {
                let _found = _.find(
                    _this.Model[category].industryIds,
                    (industry) => {
                        if (industry) {
                            return +industry.id === _itemId;
                        }
                        return false;
                    }
                );
                if (_found) {
                    let _index = _this.Model[category].industryIds.indexOf(_found);
                    _this.Model[category].industryIds.splice(_index, 1);
                }
            });
        });

        this.unsubscribeInsertSubIndustries = this.$rootScope.$on(
            'INSERT_SUB_INDUSTRIES',
            (event, value, category) => {
                let _found = _.find(
                    _this.Model[category].subIndustryIds,
                    industry => +industry.id === +value.id
                );
                if (!_found) {
                    _this.Model[category].subIndustryIds.push({
                        id: value.id,
                        name: value.value,
                        childEntities: value.childEntities
                    });
                }
            }
        );

        this.unsubscribeRemoveSubIndustries = this.$rootScope.$on(
            'REMOVE_SUB_INDUSTRIES',
            (event, value, category) => {
                let _found = _.find(
                    _this.Model[category].subIndustryIds,
                    industry => +industry.id === +value.id
                );
                if (_found) {
                    let _index = _this.Model[category].subIndustryIds.indexOf(_found);
                    _this.Model[category].subIndustryIds.splice(_index, 1);
                }
            }
        );

        this.unsubscribeFiltersSubmitted = this.$rootScope.$on(
            'FILTERS_SUBMITTED',
            () => _this.Model = _this.Filters.Get()
        );

        /**
         * Used to set range groups for budget filters
         */
        this.unsubscribeFiltersAddRangeGroup = this.$rootScope.$on(
            'FILTERS_ADD_RANGE_GROUP',
            (event, category, filter, filterModel) => {
                // find item among available items in given category... (new local scope var)
                let _tmpSelectedItem = _.find(
                    _this.rangeDropdownsGroups[category],
                    _el => _el.category === category && _el.type === filter
                );

                if (_tmpSelectedItem) {
                    // NO REFERENCE to avoid messing up with this.rangeDropdownsGroups
                    _this.selectedItem[category] = _.cloneDeep(_tmpSelectedItem);

                    // set values for min/max fields
                    _this.selectedItem[category].values = _.cloneDeep(filterModel);

                    // add form element
                    _this.addRangeGroup(category);
                }
            }
        );

        this.unsubscribeFiltersResetRangeElements = this.$rootScope.$on(
            'FILTERS_RESET_ALL_RANGE_ELEMENTS',
            () => this._resetAllRangeElements()
        );

        this.unsubscribeFiltersInitRangeElementsFromCurrentFilters = this.$rootScope.$on(
            'FILTERS_INIT_RANGE_ELEMENTS_FROM_CURRENT_FILTERS',
            () => this._initRangeElementsFromCurrentFilters()
        );

        this.unsubscribeFiltersUpdateRangeElement = this.$rootScope.$on(
            'FILTERS_ADD_RANGE_ELEMENT',
            (event, categoryName, filterName, values, setFirstElementValues) => _this.addRangeElement(categoryName, filterName, values, setFirstElementValues)
        );

        this.unsubscribeFiltersClearOneRangeElement = this.$rootScope.$on(
            'FILTERS_CLEAR_ONE_RANGE_ELEMENT',
            (event, params) => _this._clearOneRangeElement(params)
        );

        this.unsubscribeFiltersCallMultiselectItemChanged = this.$rootScope.$on(
            'FILTERS_CALL_MULTISELECT_ITEM_CHANGED',
            (event, element, category, filter, selecting) => _this.MultiSelectItemChanged(element, category, filter, selecting)
        );

        this.unsibscribeFiltersCallSelectDropdownCheckboxesByModel = this.$rootScope.$on(
            'FILTERS_CALL_SELECT_DROPDOWN_CHECKBOXES_BY_MODEL',
            (event, category, filter) => {
                let _availableOptions = _this.GetOptions(category, filter);

                if (_availableOptions) {
                    _this._selectDropdownCheckboxesByModel(category, filter, _availableOptions);
                }
            }
        );

        /**
         * handle pre-loading options for filters when needed
         */
        this._preLoadFiltersOptionsByQueue();
        this.unsubscribeFiltersPreLoadOptions = this.$rootScope.$on('FILTERS_PRE_LOAD_OPTIONS', () => {
            _this._preLoadFiltersOptionsByQueue();
        });

        this.savedQueryList = [];

        this.unsubscribeQueryLoaded = this.$rootScope.$on('QUERY_LOADED', (event, query) => {
            // this is a custom market request, reset everything
            if(query.length){
                this.savedQueryList = [];
                this.disableLocationSearchType = true;
            } else {
                if(!query.isCustomChannel && !query.isCustomMarketRequestPending){
                    this.savedQueryList.push({
                        id: query.id,
                        name: query.name
                    });

                    // ensure uniqueness
                    this.savedQueryList = _.uniqBy(this.savedQueryList, 'id');
                }
            }
        });

        this.unsubscribeFiltersRemoveSavedSearch = this.$rootScope.$on(
            'FILTERS_REMOVE_SAVED_SEARCH',
            (event, savedSearch) => this.savedQueriesRemoveQuery(savedSearch)
        )
    }

    $onDestroy() {
        this.unsubscribeInsertIndustries();
        this.unsubscribeRemoveIndustries();
        this.unsubscribeInsertSubIndustries();
        this.unsubscribeRemoveSubIndustries();
        this.unsubscribeFiltersSubmitted();
        this.unsubscribeFiltersAddRangeGroup();
        this.unsubscribeFiltersResetRangeElements();
        this.unsubscribeFiltersInitRangeElementsFromCurrentFilters();
        this.unsubscribeFiltersUpdateRangeElement();
        this.unsubscribeFiltersClearOneRangeElement();
        this.unsubscribeFiltersCallMultiselectItemChanged();
        this.unsibscribeFiltersCallSelectDropdownCheckboxesByModel();
        this.unsubscribeFiltersPreLoadOptions();
        this.unsubscribeQueryLoaded();
        this.unsubscribeFiltersRemoveSavedSearch();
    }

    /**
     * Multiselect method
     * Idea was moved from previous filters
     * TODO - Need to be refactored
     * @param element
     * @param category
     * @param filter
     * @param selecting
     * @constructor
     */
    MultiSelectItemChanged(element, category, filter, selecting) {

        // Get current state of filters
        let _filters = angular.copy(this.Filters.Get());
        let _model = this.Model[category][filter];

        // Get options for current changes
        let _options = this.Filters.GetFilterOptions(category, filter);

        if(_options && _options.contextDownload) {
            let _query = {};
            let _queryParameter = 'param.' + _options.contextDownload.parameterName;
            _query[_queryParameter] = [];

            if (category === 'location' && filter === 'continentIds') {
                /**
                 * VERSION4-2678
                 *
                 * location.continentIds
                 *  IF 'ALL' option is selected in 'CONTINENT' dropdown,
                 *  then _model contains only only one option with id: -1
                 *  we need update the model with all available continentIds options
                 *  otherwise only '-1' is passed as param to the lookup and 'COUNTRY' dropdown is empty
                 */
                if (angular.isArray(_model) && _model.length === 1 && +_model[0].id === -1) {
                    // if we are here, then 'All' is selected
                    _model = _.clone(_options.options);
                }

                // filter out the '-1'
                let _allOptionIndex = _.findIndex(_model, { id: '-1' });
                if (_allOptionIndex > -1) {
                    _model.splice(_allOptionIndex, 1);
                }
            }

            _.each(_model, (value) => {
                _query[_queryParameter].push(value.id);
            });
            this.GetNoCachingLookup(_query, _options.contextDownload.category, _options.contextDownload.filter, 1);
        }

        // Remove reference for options
        let _clonedOptions = _.clone(_options.options);

        let _childrenOfElement = [];
        if (_options.childrenId) {
            if (element.id === '-1') {
                _.each(this.Filters.GetFilterOptions(category, _options.childrenId).options, (option) => {
                    _childrenOfElement = _childrenOfElement.concat(option.childEntities) ;
                });
            } else {
                let _tmpChildCategory = _.find(
                    this.Filters.GetFilterOptions(category, _options.childrenId).options,
                    (_ch) => {
                        return +_ch.id === +element.id;
                    }
                );

                if (angular.isObject(_tmpChildCategory) &&
                    angular.isArray(_tmpChildCategory.childEntities) &&
                    _tmpChildCategory.childEntities.length
                ) {
                    _childrenOfElement = _childrenOfElement.concat(_tmpChildCategory.childEntities);
                }
            }
        }

        // Depends if selection or unselecing push or splice elements from array of children
        if (selecting) {
            _.each(_childrenOfElement, (entity) => {
                if (angular.isObject(entity)) {
                    this.Model[category][_options.childrenId].push({
                        id: entity.id,
                        name: entity.value
                    });
                }
            });
        } else {
            _.each(_childrenOfElement, (entity) => {
                let _index = _.findIndex(this.Model[category][_options.childrenId], (_element) => {
                    return +entity.id === +_element.id;
                });
                if(_index > -1) {
                    this.Model[category][_options.childrenId].splice(_index, 1);
                }
            });
        }

        if(element.id === '-1') {
            if(_.find(this.Model[category][filter], { id: '-1' })) {
                this.Model[category][filter] = _clonedOptions;
            } else {
                this.Model[category][filter].length = 0;
            }
        } else {
            let _allOption = _clonedOptions[0];
            let _allExceptedAll = _.remove(_clonedOptions, (option) => {
                return option.id !== '-1';
            });

            let _AllSelected = _allExceptedAll.every(
                (elem) => {
                    return this.Model[category][filter].indexOf(elem) > -1;
                }
            );

            if(_AllSelected && _allOption.id === '-1') {
                this.Model[category][filter].unshift(_allOption);
            } else {
                let _index = _.findIndex(this.Model[category][filter], (element) => { return element.id === '-1' });
                if(_index > -1) {
                    this.Model[category][filter].splice(_index, 1);
                }
            }
        }

        this.Filters.UpdateTemporaryFilters(_filters);
    }

    /**
     * Factory of singletons - produces objects of callbacks for ng-dropdown-multiselect -> events
     * @see http://dotansimha.github.io/angularjs-dropdown-multiselect/docs/#/main
     *
     * @onItemSelect - Fired when user select item
     * @onItemDeselect - Fired when user deselect item
     *
     * @param category
     * @param filter
     * @returns {{onItemSelect: onItemSelect, onItemDeselect: onItemDeselect}}
     * @constructor
     */
    EventsFactory(category, filter) {
        let filterPath = category + '.' + filter;
        if (!this.eventsFactoryInstances[filterPath]) {
            this.eventsFactoryInstances[filterPath] = {
                onInitDone: () => {
                    // ensure checkboxes are selected in dropdown(s) (if any option has been selected)
                    if (category === 'enterprise' && filter === 'industryIds' ||
                        category === 'market' && filter === 'ids'
                    ) {
                        let _availableOptions = this.GetOptions(category, filter);
                        if (_availableOptions) {
                            this._selectDropdownCheckboxesByModel(category, filter, _availableOptions);
                        }
                    }
                },
                onItemSelect: (element) => {
                    this.MultiSelectItemChanged(element, category, filter, true);
                },
                onItemDeselect: (element) => {
                    this.MultiSelectItemChanged(element, category, filter, false);
                    this.resetLocationSearchTypeDropdown();
                }
            };
        }
        return this.eventsFactoryInstances[filterPath];
    }

    /**
     * Method called when user selects something from dropdowns
     * @param category
     * @param filter
     * @returns {string}
     * @constructor
     */
    GetMultiselectElements(category, filter) {
        if (this.Filters.Get()[category][filter] && this.Filters.Get()[category][filter].length) {
            let _items = '';
            this.Filters.Get()[category][filter].forEach(value => {
                let element = _.find(this.GetOptions(category, filter), { id: value.id });
                if (element) {
                    _items ? _items = _items + ', ' : null;
                    _items = _items  + element.name;
                }
            });
            return _items;
        } else {
            return this.GetPlaceholder(category, filter);
        }
    }

    /**
     * Method calling when user press designed key
     *
     * @param chip
     * @param category
     * @param filter
     * @returns {*}
     */
    TransformChip(chip, category, filter) {
        // Md-chips is not supporting duplicates
        // Some random characters need to add as a property to every chips
        // To avoid that problem
        // Random characters will be not visible anywhere : controlValue property
        let _booleanSearch = false;
        let _model = this.Model[category][filter];
        let _fieldOptions = this.Filters.GetFilterOptions(category, filter);
        if(chip.toLowerCase() === 'and' || chip.toLowerCase() === 'or' || chip.toLowerCase() === 'not') {
            // Boolean search property can be added only one in a row
            // I.e: 'Value', 'AND', 'Value2'
            // Wrong I.e: 'Value', 'AND', 'OR'
            if(_model[_model.length - 1] && _model[_model.length - 1].booleanSearch) {
                return null;
            }

            // Check if provided operator is supported in field
            // If not leave it
            if (!_.some(
                    _fieldOptions.booleanSearchOperators,
                    operator => operator.toLowerCase() === chip.toLowerCase()
                )
            ) {
                return null;
            }
            _booleanSearch = true;
            chip = chip.toUpperCase();

            // if user pastes an array of values and hits enter
        } else if (chip.indexOf(',') > -1 && !(chip.charAt(0) === '"' && chip.charAt(chip.length - 1) === '"')) {
            let seperatedString = angular.copy(chip);
            // Changed in
            // https://aberdeenjira.atlassian.net/browse/VERSION4-3718
            // seperatedString = seperatedString.toString().replace(/,\s*$/, "");
            let chipsArray = seperatedString.split(',');
            for(let i = 0; i < chipsArray.length; i++){
                this.Model[category][filter].push({
                    name: chipsArray[i],
                    booleanSearch: false,
                    controlValue: Math.random().toString(36).substring(7)
                });
            }

            return null;

        } else if(chip.charAt(0) === '"' && chip.charAt(chip.length - 1) === '"') {
            // Changed in
            // https://aberdeenjira.atlassian.net/browse/VERSION4-3718
            // chip = chip.replace(/^"|"$/g, '');
            chip = chip.replace(/[,]+/g, '');
        }
        return { name: chip, booleanSearch: _booleanSearch, controlValue: Math.random().toString(36).substring(7) };
    }

    /**
     * Method called for placeholder for input
     * @param category
     * @param filter
     * @param key
     * @constructor
     */
    GetPlaceholder(category, filter, key) {
        let _options = this.Filters.GetFilterOptions(category, filter);
        if(key) {
            return _options[key].placeholder;
        } else {
            return _options.placeholder;
        }
    }

    /**
     * Method called to insert options into object
     * @param category
     * @param filter
     * @param options
     * @constructor
     * @private
     */
    SetFilterOptions(category, filter, options) {
        this.Filters.SetFilterOptions(category, filter, 'options', options);
    }

    /**
     * Method called when options are getting from server
     * @param category
     * @param filter
     * @param status
     * @constructor
     */
    SetLoadingStatus(category, filter, status) {
        this.Filters.SetFilterOptions(category, filter, 'loading', status);
    }

    getLoadingStatus(category, filter) {
        return this.Filters.GetFilterOptions(category, filter).loading;
    }

    /**
     * Method calling for options for dropdown
     * @param category String
     * @param filter String
     * @param cacheDisabled
     * @constructor
     */
    GetOptions(category, filter, cacheDisabled) {
        // Prevent error when category or filter will be not defined from view
        // Sometimes model can handle null value when context element will be not choosen
        if(!category || !filter) {
            return;
        }

        // If options available in object, just return them
        // If options unavailable get it from cache or from API
        let _filterOptions = this.Filters.GetFilterOptions(category, filter);

        // If filter options are not defined it means filter is wrong defined in view, or options are not defined in _filtersOptions variable
        if(!_filterOptions) {
            this.$log.error(category + '.' + filter + ' has no defined options in filter.service in \'_filtersOptions\' variable.');
            return;
        }
        let _options = _filterOptions.options;
        let _loading = _filterOptions.loading;

        // Check if options array is defined in settings
        if(!_options) {
            this.$log.error('The ' + category + '.' + filter + ' options are not defined.');
            return;
        }

        // Get children of called lookup - only if childrenId is defined in settings
        if(_filterOptions.childrenId) {
            this.GetOptions(category, _filterOptions.childrenId, false);
        }

        if(_options.length || cacheDisabled) {
            return _options;
        }

        // Leave function if loading is in progress
        if(_loading) {
            return;
        }

        // Make it busy to avoid digest problem
        this.SetLoadingStatus(category, filter, true);

        // Get data from cache or API
        // Second argument says we want to add 'All' option at the beginning of array
        this.Cache.GetLookup(filter, _filterOptions.addAllOption).then(
            lookup => {
                // Set values into valid filter
                this.SetFilterOptions(category, filter, lookup);

                // Make it free - all data is loaded
                this.SetLoadingStatus(category, filter, false);

                let _options = this.Filters.GetFilterOptions(category, filter).options;

                /**
                 * VERSION4-2277 enable separator line for the first custom market/channel
                 * custom channel === (id > 999)
                 */
                if (category === 'market' && filter === 'ids') {
                    for (let i = 0; i < _options.length; i++) {
                        if (+_options[i].id > 999) {
                            _options[i].separatorLine = true;
                            break;
                        }
                    }
                }

                // send notification...
                this.$rootScope.$emit('FILTERS_OPTIONS_LOADED', category, filter);

                // ensure checkboxes are selected in dropdown (if any option has been selected)
                if (category === 'enterprise' && filter === 'industryIds' ||
                    category === 'market' && filter === 'ids'
                ) {
                    this._selectDropdownCheckboxesByModel(category, filter, _options);
                }

                if (category === 'location' && filter === 'locationRuleId'){
                    _options.sort((a, b) => a.id - b.id)
                }

                // Return values to view
                return _options;
            }, (error) => {
                this.$log.error('Error during the getting options for ' + category + '.' + filter);
                this.$log.error(error);
            }
        );
    }

    /**
     * Check if current filter is enabled
     * @param name
     * @returns {boolean}
     * @constructor
     */
    IsFilterEnabled(name) {
        const _availableFilters = this.Filters.GetAvailableFilters(this.$state.current.name);
        return typeof(_availableFilters) !== 'undefined' ? _availableFilters.indexOf(name) > -1 : false;
    }

    /**
     * Get lookup name from view
     * It is connected with lookups which are not caching
     * @param category
     * @param filter
     * @returns {string|string|string}
     * @constructor
     */
    GetLookupName(category, filter) {
        // Prevent call API when category of filter will be not defined
        if(!category || !filter) {
            return;
        }
        return this.Filters.GetFilterOptions(category, filter).lookupName;
    }

    /**
     * Get lookup from API
     * That lookups will be not cached because of context
     * @param query
     * @param category
     * @param filter
     * @param min
     * @constructor
     */
    GetNoCachingLookup(query, category, filter, min) {

        // Prevent calling API when lookup name will be not defined
        // That request will be returned with 400 error
        if(typeof query !== 'object' && !query.length || !category || !filter) {
            return;
        }

        // Get lookup name to prepare request
        let _lookupName = this.GetLookupName(category, filter);

        if(!_lookupName) {
            this.$log.error(category + '.' + filter + ' has no lookupName property which is required.');
            return;
        }

        // Check if provided query is not a boolean search operator
        // If yes do not load lookup
        if(typeof query !== 'object' && this.IsBooleanSearchProvided(query)) {
            return true;
        }

        // Build query
        if(typeof query === 'string') {
            query = { 'param.query': query };
        }

        // Prepare object from string
        if(typeof query === 'string') {
            query = { 'param.query': query };
        }

        return this.Lookup.Get(query, _lookupName, min)
            .then((lookup) => {
                this.SetFilterOptions(category, filter, lookup);
            }, (error) => {
                this.$log.error(error);
            });
    }

    /**
     * Check if provided string is one of boolean search operator
     * @param name
     * @returns {boolean}
     * @constructor
     */
    IsBooleanSearchProvided(name) {
        return name.toLowerCase() === 'and' || name.toLowerCase() === 'or' || name.toLowerCase() === 'not';
    }

    /**
     * Prevent insert different characters than numbers
     *
     * @param event
     */
    preventNotNumericInput(event) {
        this.AppHelper.preventNotNumericInput(event);
    }

    /**
     * VERSION4-1935 prevent enter to avoid empty bubbles
     *
     * @param event
     * @param value
     * @param category
     * @param filter
     */
    OnKeypressPreventEnter(event, value, category, filter) {
        // Check if value is not specified as a special value
        // For that case disable that feature and make enter key available to use
        if (event.which === 13 && !this.IsBooleanSearchProvided(value)) {
            event.preventDefault();
        }
        // If that is valid boolean search operator
        // and every conditions are correct, insert operator directly to tags
        // Leave tagging from ui-select, because we dont need to make possible to insert everything into model
        // Just boolean search needed
        if (value && this.IsBooleanSearchProvided(value) && event.which === 13 && category && filter) {

            // Boolean search property can be added only one in a row
            // I.e: 'Value', 'AND', 'Value2'
            // Wrong I.e: 'Value', 'AND', 'OR'
            if(!this.Model[category][filter][this.Model[category][filter].length - 1] || (this.Model[category][filter][this.Model[category][filter].length - 1] && !this.Model[category][filter][this.Model[category][filter].length - 1].booleanSearch)) {
                this.Model[category][filter].push({ name: value.toUpperCase(), booleanSearch: true, controlValue: Math.random().toString(36).substring(7) });
            }

            // Clear input value outside of ui-select
            // $select.search variable is isolated
            $(event.target).val('');
        }

    }

    /**
     * When code type will be changed call this method to change selected model to contains values
     * @param category
     * @param filter
     * @constructor
     */
    CodeTypeChange(category, filter) {
        let _codeTypes =  this.Filters.GetFilterOptions(category, filter).options;
        _.each(_codeTypes, (codeType) => {
            if(this.Model[category][filter] !== codeType.id) {
                this.Model[category][codeType.id] = {};
            }
        });
    }

    /**
     * Remove all options when close ui-select
     * @param list
     * @returns {*}
     * @constructor
     */
    ClearList(category, filter) {
        this.SetFilterOptions(category, filter, []);
    }

    /**
     * Method calling from view
     * It compare objects and decide if button should be available as a orange or disabled
     * @returns {*}
     * @constructor
     */
    IsButtonEnabled() {
        return this.Filters.IsButtonEnabled();
    }

    IsTooltipForButtonVisible() {
        return !this.Filters.AdditionalButtonCondition();
    }

    /**
     * Method calling from view, it will return valid button text to show
     * @returns {string}
     * @constructor
     */
    GetButtonText() {
        return this.Filters.GetButtonText();
    }

    /**
     * Method returns available key codes
     * @returns {[number,number,number,number]}
     * @constructor
     */
    GetKeyCodes() {
        return this._keyCodesToEnter;
    }

    /**
     * Method calling when user click on filter row
     * @constructor
     */
    Toggle(element) {
        this._toggle[element] = !this._toggle[element];
    }

    /**
     * Method calling when user was able to update results, and click it
     * @constructor
     */
    Update(isButtonForceDisabled) {
        if(isButtonForceDisabled === true) {
            return;
        }
        this.Filters.Update();
        this.Filters.CollapseSearchPanel();
        this.SelectSearchResults.resetModal();
    }

    /**
     * Method calling from view
     * @constructor
     */
    IsExpanded(element) {
        return this._toggle[element];
    }

    /**
     * Get Total results number
     * @returns {number}
     * @constructor
     */
    GetTotalResults() {
        return this.Filters.GetTotalResults();
    }

    /**
     * Open Industries Browser modal
     */
    OpenIndustriesBrowser(category) {
        this.AppHelper.openDialog({
            component: 'industries-browser-modal',
            resolve: {
                params: () => ({
                    category: category
                })
            }
        });
    }

    /**
     * Open Products Browser modal
     */
    OpenProductsBrowser() {
        this.AppHelper.openDialog({
            component: 'products-browser-modal'
        });
    }

    /**
     * Method which checking if max value is greater than min value
     * @param min
     * @param max
     * @returns {boolean}
     */
    isInputGreaterThan(min, max) {
        return this.AppHelper.isGreaterThan(min, max);
    }

    /**
     * In some cases overwrite model is needed
     * @param category
     * @param filter
     * @param type
     * @constructor
     */
    OverwriteModel(category, filter, type) {
        if(type === 'array' && this.Model[category][filter]) {
            this.Model[category][filter] = [this.Model[category][filter]];
        }
    }

    /**
     * For some cases load all lookups in the background
     * @constructor
     */
    LoadAllLookups() {
        this.Cache.GetAllLookups();
    }

    /**
     * Load Saved Searches initiated by action
     */
    LoadQuery(queryId) {
        this.Filters.GetSavedSearch(queryId);
    }

    openNutsCodesBrowser() {
        this.AppHelper.openDialog({
            component: 'nuts-codes-browser-modal'
        });
    }

    onRemoveNutsCode(removedItem) {
        if (this._clearNutsCodeProcessing) {
            // it is already processing - let's bail out
            return;
        }
        this.checkLocationFilters();
        this._clearNutsCodeProcessing = true;

        let _currentFilterValues = this.Filters.Get().location.nutsCodes;

        this.NutsCodes.removeCode(removedItem, _currentFilterValues)
            .then(
                (_updatedFilerValues) => {
                    this.Model.location.nutsCodes = _updatedFilerValues;
                    this.Filters.SetFilterValue('location', 'nutsCodes', _updatedFilerValues);
                    this._clearNutsCodeProcessing = false;
                }
            );
    }

    // manage state of location search type filter
    checkLocationFilters() {
        // get current filters of location category
        const _currentFilterValues = this.Filters.Get().location;
        // loop over location filters and see if anything's populated
        for (let _location in _currentFilterValues) {
            // enable/disable location search type filters
            if(_currentFilterValues[_location].length){
                this.disableLocationSearchType = false;
                break;
            } else {
                this.disableLocationSearchType = true;
            }
        }
    }

    /**
     * in case some options are pre-chosen/pre-selected in other way then by clicking on one of dropdown options,
     * we need to ensure checkboxes are selected, so we need to replace selected options
     * with references taken from _availableOptions
     *
     * the point is: checkboxes in dropdown will be selected only if there will be reference
     * between this.Model[category][filter] and options used for dropdown elements
     * otherwise, checkboxes are loaded unchecked regardless on this.Model[category][filter] elements
     *
     * if there are available options or filter values are not an array, then method does nothing
     *
     * @param category {String}
     * @param filter {String}
     * @param _availableOptions {Array} - options loaded from GetOptions method
     * @private
     */
    _selectDropdownCheckboxesByModel(category, filter, _availableOptions) {
        if (_availableOptions && angular.isArray(this.Model[category][filter])) {
            const _selectedOptionsCopy = _.clone(this.Model[category][filter]);
            this.Model[category][filter] = [];

            _selectedOptionsCopy.forEach(_selectedOption => {
                const _industry = _.find(_availableOptions, _option => +_option.id === +_selectedOption.id);

                if (_industry) {
                    this.Model[category][filter].push(_industry);
                }
            });
        }
    }

    /**
     * VERSION4-3861
     *
     * clear 'Email Verification' filter when Model.contact.contactSearchType is set to 'withoutemail'
     */
    emailFilerAfterSelect() {
        if (this.Model.contact.contactSearchType === 'withoutemail') {
            this.Model.contact.contactEmailType = '';
        }
    }

    /**
     * VERSION4-3478
     *
     * options handler for savedQueries
     *
     * @uses {@link Filters.GetOptions}
     *
     * @return {*}
     */
    savedQueriesGetOptions() {
        let _tmpOptions = this.GetOptions('savedQueries', 'savedSearches', true);

        if(!_tmpOptions.length &&
            this.Model.savedQueries.savedSearches[0] &&
            this.Model.savedQueries.savedSearches[0].id &&
            this.Model.savedQueries.selectedId > 0
        ) {
            const _tmpFound = _.find(_tmpOptions, _option => _option.id === this.Model.savedQueries.selectedId);

            if (!_tmpFound) {
                _tmpOptions = this.Model.savedQueries.savedSearches;
            }
        }

        return _tmpOptions;
    }

    /**
     * Triggers the the remove query process - first, popup is displayed and user may cancel or proceed
     *
     * @param query
     */
    savedQueriesRemoveQuery(query) {
        this.AppHelper.openDialog({
            component: 'process-info-modal',
            resolve: {
                params: () => ({
                    processCallback: _dialog => {
                        _dialog.isProcessing = false;
                        _dialog.message = 'Query ' + query.name + ' will be removed - are you sure you want to proceed?';
                        _dialog.messageType = 'success';

                        _dialog.button1Text = 'Cancel';
                        _dialog.button2Text = 'Proceed';

                        // #modalclosing prevent closing dialog when action is running
                        this.AppHelper.setOnModalClosingListener(_dialog.$scope, _dialog, 'isProcessing');

                        _dialog.button2Callback = () => {
                            _dialog.message = '';
                            _dialog.isProcessing = true;
                            // hide buttons by making the texts empty
                            _dialog.button2Text = '';
                            _dialog.button1Text = '';

                            this.GetFiltersJSON.deleteQuery(query.id)
                                .then(
                                    res => {
                                        _dialog.isProcessing = false;

                                        // add filter to pre-load queue and then clear the lookup
                                        this.Filters.addFilterToPreLoadOptionsQueue('savedQueries', 'savedSearches');
                                        this.Cache.clearLookup('savedSearches', true);

                                        if (res.status === 404) {
                                            _dialog.messageType = 'error';
                                            _dialog.button1Text = 'OK';
                                            _dialog.message = 'Query not found.';
                                        } else {
                                            // query successfully removed
                                            _dialog.message = 'Query has been removed';
                                            _dialog.messageType = 'success';
                                            _dialog.button1Text = 'OK';

                                            if (query.id === this.Model.savedQueries.loadedId || query.id === this.Model.savedQueries.selectedId) {
                                                // currently loaded query OR selected query has been removed
                                                this.Model.savedQueries.savedSearches = [];
                                                this.Model.savedQueries.selectedId = 0;
                                                this.Filters.Update();
                                            }
                                        }
                                    }
                                )
                                .catch(
                                    err => {
                                        _dialog.isProcessing = false;

                                        _dialog.messageType = 'error';

                                        if (err.status === 404) {
                                            _dialog.message = 'Query not found.';
                                            _dialog.button1Text = 'OK';
                                        } else {
                                            _dialog.message = 'There was an error - please try again...';
                                            _dialog.button1Text = 'Cancel';
                                            _dialog.button2Text = 'Proceed';
                                        }

                                        this.AppHelper.logError('Delete saved search error', err);
                                    }
                                );
                        };
                    }
                })
            }
        });
    }

    // open modal to request saved query for custom market
    openSavedQueryCustomMarketRequest() {
        this.AppHelper.openDialog({
            component: 'request-saved-query-modal',
            resolve: {
                params: () => ({
                    savedQueryList: this.savedQueryList
                })
            }
        });
    }

    /**
     * Adds range element to the category.filter collection
     *
     * @param category
     * @param filter
     * @param filterValuesToSet
     * @param setFirstElementValues
     */
    addRangeElement(category, filter, filterValuesToSet, setFirstElementValues = false) {
        const elementType = this.Filters.getRangeElementType(category, filter);

        if (setFirstElementValues && Array.isArray(this.rangeFieldsData[category][elementType]) && this.rangeFieldsData[category][elementType].length > 0) {
            /**
             * if we are here, then we have one range element present in collection for given category.elementType
             */
            this.rangeFieldsData[category][elementType][0].values = filterValuesToSet;

            // overwrite element's 'elementGlobalIndex' to be same as for values
            this.rangeFieldsData[category][elementType][0].elementGlobalIndex = +filterValuesToSet.elementGlobalIndex;
            this.rangeFieldsData[category][elementType][0].searchParamOperator = filterValuesToSet.searchParamOperator;
        } else {
            /**
             * if we are here then we just need to add another element
             */
            let elementGlobalIndex = 0;
            let searchParamOperator = 0;
            if (filterValuesToSet && typeof filterValuesToSet === 'object') {
                elementGlobalIndex = filterValuesToSet.elementGlobalIndex;
                searchParamOperator = filterValuesToSet.searchParamOperator;
            } else {
                elementGlobalIndex = this.Filters.getRangeElementsGlobalIndex();
                searchParamOperator = 'OR';
            }

            if (!this.rangeFieldsData[category]) {
                this.rangeFieldsData[category] = {};
            }

            if (!this.rangeFieldsData[category][elementType]) {
                this.rangeFieldsData[category][elementType] = [];
            }

            this.rangeFieldsData[category][elementType].push({
                category,
                filter,
                values: {
                    ...filterValuesToSet,
                    elementGlobalIndex
                },
                elementType,
                label: '',
                elementGlobalIndex,
                searchParamOperator
            });
        }

        // ensure label for first element in collection
        if (this.filtersOptions[category][filter] && this.filtersOptions[category][filter].label) {
            this.rangeFieldsData[category][elementType][0].label = this.filtersOptions[category][filter].label;
        }

        if (elementType === 'itBudget' || category === 'technologyCounts') {
            this.rangeDropdownEnabled[category] = false;
        }
    }

    addRangeGroup(category) {
        this.addRangeElement(category, this.selectedItem[category].filter);

        const _this = this;

        this.rangeDropdownsGroups[category] = this.rangeDropdownsGroups[category].filter(
            dropdownElement => dropdownElement.filter !== _this.selectedItem[category].filter
        );

        this.selectedItem[category] = {};
        this.rangeDropdownEnabled[category] = false;
    }

    /**
     * Updates model and filters for ranges
     *
     * @param params
     */
    updateRangesModel(
        params = {
            category: '',
            filter: '',
            range: '', // 'min' or 'max'
            value: '',
            elementIndex: 0,
            elementGlobalIndex: 0,
            searchParamOperator: 'OR'
        }
    ) {
        if (params.category === 'enterprise' || params.category === 'site') {
            /**
             * multi range filter(s) object(s) with boolean search
             */
            // ensure default value for this.Model
            if (!this.Model[params.category][params.filter]) {
                this.Model[params.category][params.filter] = [];
            }

            // ensure default value for this.Model.category.filter
            if (!this.Model[params.category][params.filter][params.elementIndex]) {
                this.Model[params.category][params.filter][params.elementIndex] = {
                    min: null,
                    max: null,
                    elementGlobalIndex: params.elementGlobalIndex,
                    searchParamOperator: params.searchParamOperator === 'NOT' ? 'NOT' : 'OR'
                };
            } else {
                this.Model[params.category][params.filter][params.elementIndex].elementGlobalIndex = params.elementGlobalIndex;
                this.Model[params.category][params.filter][params.elementIndex].searchParamOperator = params.searchParamOperator;
            }

            this.Model[params.category][params.filter][params.elementIndex][params.range] = params.value;
        } else {
            /**
             * default single range filter(s) object(s) - no boolean search (YET :) )
             */
            // ensure default value for this.Model.category.filter
            if (!this.Model[params.category][params.filter]) {
                this.Model[params.category][params.filter] = {
                    min: null,
                    max: null,
                };
            }

            this.Model[params.category][params.filter][params.range] = params.value;
        }

        this.Filters.UpdateFiltersBy(this.Model);
    }

    removeRangeFieldsElement(category, filter, elementGlobalIndex) {
        const elementType = this.Filters.getRangeElementType(category, filter);

        // first, let's try to find the element by global index
        const rangeFieldsElementIndex = _.findIndex(
            this.rangeFieldsData[category][elementType],
            rangeFieldElement => rangeFieldElement.elementGlobalIndex === elementGlobalIndex
        );

        if (rangeFieldsElementIndex < 0) {
            this.AppHelper.logError(
                `FiltersCTRL: removeRangeFieldsElement: element not found, rangeFieldsElementIndex ${rangeFieldsElementIndex}`
            );
            return;
        }

        // update model
        switch (elementType) {
            case 'itBudget':
            case 'revenue':
            case 'employees':
                // multi range(s)
                const modelElementIndex = _.findIndex(
                    this.Model[category][filter],
                    modelElement => modelElement.elementGlobalIndex === elementGlobalIndex
                );

                if (modelElementIndex > -1) {
                    // multi range - first element need to be kept
                    if (elementType === 'itBudget' || this.Model[category][filter].length > 1) {
                        this.Model[category][filter].splice(modelElementIndex, 1);
                    } else {
                        this.Model[category][filter] = [{
                            min: null,
                            max: null
                        }];
                    }
                }
                break;
            case 'technologyCounts':
                // single range
                this.Model[category][filter] = {
                    min: null,
                    max: null
                };
                break;
            default:
                this.AppHelper.logError(`FiltersCTRL: removeRangeFieldsElement: invalid type given ${elementType}`);
        }

        const rangeFieldsElement = this.rangeFieldsData[category][elementType][rangeFieldsElementIndex];

        if (rangeFieldsElement && rangeFieldsElement.elementGlobalIndex > -1) {
            this._clearOneRangeElement({
                category,
                filter,
                elementGlobalIndex: rangeFieldsElement.elementGlobalIndex
            });
        }

        this.Filters.UpdateFiltersBy(this.Model);
    }

    /**
     * prepare range (min-max) fields
     *
     * @private
     */
    _resetAllRangeElements() {
        this.Filters.setRangeElementsGlobalIndex(1);

        // data for 'min-max-fields' components / ranges
        this.rangeFieldsData = {
            cp: {
                technologyCounts: []
            },
            enterprise: {
                revenue: [], // data for 'Accounts' -> 'Revenue'
                employees: [], // data for 'Accounts' -> 'Employees'
                itBudget: [] // data for 'Accounts' -> 'IT Budget in U.S. Dollars'
            },
            site: {
                revenue: [], // data for 'Accounts' -> 'Revenue'
                employees: [], // data for 'Accounts' -> 'Employees'
                itBudget: [] // data for 'Accounts' -> 'IT Budget in U.S. Dollars'
            }

        };

        /**
         * build array of elements for dropdowns,
         * that generate min max groups for selected items
         *
         * currently handled filters:
         * - current purchases (technology installs): TECHNOLOGY COUNTS
         * - site: IT Budget in U.S. Dollars
         * - enterprise: IT Budget in U.S. Dollars
         */
        const _this = this;
        ['cp', 'site', 'enterprise'].forEach(_categoryName => {
            _this.rangeDropdownEnabled[_categoryName] = true;
            _this.rangeDropdownsGroups[_categoryName] = [];
            _.forEach(this.filtersOptions[_categoryName], (option, _filterName) => {
                if (option.min && option.label) {
                    _this.rangeDropdownsGroups[_categoryName].push(
                        {
                            category: _categoryName,
                            filter: _filterName,
                            label: option.label
                        }
                    );
                }
            });

            _this.rangeDropdownsGroups[_categoryName].sort((a, b) => {
                if (a.label < b.label) {
                    return -1;
                }

                if (a.label > b.label) {
                    return 1;
                }

                return 0;
            });
        });

        this.addRangeElement('enterprise', 'revenues');
        this.addRangeElement('enterprise', 'employees');
        this.addRangeElement('site', 'revenues');
        this.addRangeElement('site', 'employees');

        this.savedQueryList = [];
    }

    _clearOneRangeElement(
        params = {
            category: '',
            filter: '',
            elementGlobalIndex: 0
        }
    ) {
        let elementType = this.Filters.getRangeElementType(params.category, params.filter);

        let enableDropdownAndSortGroupElements = false;

        if (elementType === 'technologyCounts') {
            /**
             * single range filter mode
             */
            this.rangeFieldsData[params.category] = [];

            enableDropdownAndSortGroupElements = true;
        } else if (Array.isArray(this.rangeFieldsData[params.category][elementType])) {
            /**
             * multi range filter mode
             */
            if (elementType === 'itBudget' || this.rangeFieldsData[params.category][elementType].length > 1) {
                /**
                 * If we are here, then we have itBudget OR we have more than one element in collection
                 * we need to remember about the rules:
                 * - for itBudget all range elements can be removed and removing last element means dropdown activation
                 * - for revenue and site, first element cannot be removed - it must be left visible and can be only nulled/reset
                 */

                // first, let's try to find the element by global index
                const rangeFieldsIndex = _.findIndex(
                    this.rangeFieldsData[params.category][elementType],
                    rangeFieldElement => rangeFieldElement.elementGlobalIndex === params.elementGlobalIndex
                );

                if (rangeFieldsIndex > -1) {
                    // ok, so we have found the element
                    if (rangeFieldsIndex > 0 || elementType === 'itBudget') {
                        /**
                         * if we are here, then this is 'itBudget' type element
                         * OR
                         * it is an element added with '+ ADD ANOTHER' button
                         * so we need to remove the element
                         */
                        this.rangeFieldsData[params.category][elementType].splice(rangeFieldsIndex, 1);
                    } else {
                        /**
                         * if we are here, then this is the first element and it does not belong to 'itBudget'
                         * so we cannot remove it
                         * we must reset element values/settings instead
                         */
                        this.rangeFieldsData[params.category][elementType][rangeFieldsIndex].values.min = null;
                        this.rangeFieldsData[params.category][elementType][rangeFieldsIndex].values.max = null;
                        this.rangeFieldsData[params.category][elementType][rangeFieldsIndex].searchParamOperator = 'OR';
                    }
                }
            } else {
                /**
                 * if we are here, then this is not itBudget (budgets)
                 * this is revenue or employees - first element must exist
                 */
                if (this.rangeFieldsData[params.category][elementType].length) {
                    this.rangeFieldsData[params.category][elementType][0].values.min = null;
                    this.rangeFieldsData[params.category][elementType][0].values.max = null;
                    this.rangeFieldsData[params.category][elementType][0].searchParamOperator = 'OR';
                    this.rangeFieldsData[params.category][elementType][0].elementIndex = 0;
                } else {
                    this.AppHelper.logError(`FiltersCTRL: _clearOneRangeElement: no range element found for ${elementType}`);
                }
            }

            // ensure label for first element in collection
            if (this.rangeFieldsData[params.category][elementType].length) {
                this.rangeFieldsData[params.category][elementType][0].label = this.filtersOptions[params.category][params.filter].label;
            }

            if (this.rangeFieldsData[params.category][elementType].length < 1) {
                enableDropdownAndSortGroupElements = true;
            }
        }

        if (enableDropdownAndSortGroupElements) {
            /**
             * if we are here, then all range elements has been removed for range group
             * so we can enable group dropdown (it budget)
             */
            this.selectedItem[params.category] = {};

            this.rangeDropdownEnabled[params.category] = true;

            // ensure group is present in groups buffer
            const _tmpAlreadyExistentRangeGroup = _.find(
                this.rangeDropdownsGroups[params.category],
                _element => _element.filter === params.filter
            );
            if (!_tmpAlreadyExistentRangeGroup) {
                // group does not exist - let's add one
                this.rangeDropdownsGroups[params.category].push({
                    category: params.category,
                    filter: params.filter,
                    label: this.filtersOptions[params.category][params.filter].label
                });
            }

            // sort the groups to keep the order
            this.rangeDropdownsGroups[params.category].sort((a, b) => {
                if (a.label < b.label) {
                    return -1;
                }

                if (a.label > b.label) {
                    return 1;
                }

                return 0;
            });
        }
    }

    _initRangeElementsFromCurrentFilters() {
        ['enterprise', 'site', 'cp'].forEach(categoryName => {
            if (this.Model[categoryName]) {
                _.each(this.Model[categoryName], (filterObj, filterName) => {
                    const _options = this.filtersOptions[categoryName][filterName];
                    if (!_options || !_options.property) {
                        return;
                    }

                    const elementType = this.Filters.getRangeElementType(categoryName, filterName);

                    if (!this.rangeFieldsData[categoryName] || !this.rangeFieldsData[categoryName][elementType]) {
                        // if we are here, then element has not implemented min-max fields
                        if (_options.property === 'rangeObject') {
                            // ensure proper format and values for each rangeObject element
                            this.Model[categoryName][filterName] = {
                                min: filterObj.min ? filterObj.min : null,
                                max: filterObj.max ? filterObj.max : null
                            };
                        }
                    } else {
                        // elements with min-max fields implemented
                        if (_options.property === 'multiRangeObject') {
                            _.each(filterObj, (multiRangeFilter, elementIndex) => {
                                // ensure min/max values
                                if (!this.Filters.isRangeValue(multiRangeFilter.min) &&
                                    !this.Filters.isRangeValue(multiRangeFilter.max) &&
                                    multiRangeFilter.value &&
                                    typeof multiRangeFilter.value === 'object'
                                ) {
                                    multiRangeFilter.min = multiRangeFilter.value.min;
                                    multiRangeFilter.max = multiRangeFilter.value.max;
                                }

                                if (this.Filters.isRangeValue(multiRangeFilter.min) || this.Filters.isRangeValue(multiRangeFilter.max)) {
                                    const elementGlobalIndex = this.Filters.getRangeElementsGlobalIndex();
                                    this.addRangeElement(
                                        categoryName,
                                        filterName,
                                        {
                                            min: multiRangeFilter.min,
                                            max: multiRangeFilter.max,
                                            elementGlobalIndex,
                                            searchParamOperator: multiRangeFilter.searchParamOperator === 'NOT' ? 'NOT' : 'OR'
                                        },
                                        elementIndex === 0
                                    );
                                }
                            })
                        } else if (_options.property === 'rangeObject') {
                            if (this.Filters.isRangeValue(filterObj.min) || this.Filters.isRangeValue(filterObj.max)) {
                                // single range object filter (no boolean search here)
                                const elementGlobalIndex = this.Filters.getRangeElementsGlobalIndex();

                                this.addRangeElement(
                                    categoryName,
                                    filterName,
                                    {
                                        min: filterObj.min,
                                        max: filterObj.max,
                                        elementGlobalIndex
                                    },
                                    true
                                );
                            }
                        }
                    }
                });
            }
        })
    }

    _preLoadFiltersOptionsByQueue() {
        _.each(this.Filters.getPreLoadOptionsQueue(), obj => {
            this.GetOptions(obj.category, obj.filter);
        });

        this.Filters.resetPreLoadOptionsQueue();
    }
}

export default FiltersController;
