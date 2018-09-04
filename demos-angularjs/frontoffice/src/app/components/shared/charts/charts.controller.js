class ChartsController {
    /** @ngInject */
    constructor($rootScope, $log, $q, $filter, Charts, Filters, Lookup, $window, $timeout) {
        this.$rootScope = $rootScope;
        this.$log = $log;
        this.$filter = $filter;
        this.Charts = Charts;
        this.Filters = Filters;
        this.Lookup = Lookup;
        this.$window = $window;
        this.$timeout = $timeout;

        /**
         * Temporary solution
         * Countries are not available in that controller
         * Code was moved from old part of system
         * TODO - Refactoring
         */
        this.GetCountries = () => {
            this._countriesLoading = true;
            let deferred = $q.defer();
            if(!this._countries) {
                this.Lookup.Get('', 'Countries')
                    .then(countries => {
                        deferred.resolve(countries);
                        this._countries = countries;
                        this._countriesLoading = false;
                    });
            } else {
                this._countriesLoading = false;
                deferred.resolve(this._countries);
            }
            return deferred.promise;
        };

        this.GetContinents = () => {
            this._countriesLoading = true;
            let deferred = $q.defer();
            if(!this._countries) {
                this.Lookup.Get('', 'Continents')
                    .then(continents => {
                        deferred.resolve(continents);
                        this._continents = continents;
                        this._continentsLoading = false;
                    });
            } else {
                this._continentsLoading = false;
                deferred.resolve(this._continents);
            }
            return deferred.promise;
        }
    }

    $onInit() {
        this._countries = null;
        this._continents = null;
        this._countriesLoading = false;
        this._continentsLoading = false;
        this.mapDataUS = [];
        this.mapDataCan = [];
        this.mapDataEU = [];

        this.Charts.SetLoadingStatus(false);

        this.colors = this.Charts.GetColors();

        this.GetCharts(this.page);

        this._lastGetChartsCallbackPending = null;
        this._element = null;
        this.data = null;
        this.chart = null;

        /**
         * Listener
         * When UPDATE_COUNTS event will be emitted
         * Load new counts
         *
         * We need to unregister this listener on each $destroy to avoid listeners multiplication
         */
        this.unregisterUpdateChartsListener = this.$rootScope.$on('UPDATE_CHARTS', () => {
            this.GetCharts(this.page);
        });
    }

    /**
     * Get charts data
     * @constructor
     */
    GetCharts(page) {

        // Prevent getting counts multiple times
        if(this.IsLoading()) {
            this._lastGetChartsCallbackPending = () => {
                this.GetCharts(page);
            };
            return;
        }

        // Charts are loading
        this.Charts.SetLoadingStatus(true);

        // Get charts using filters object
        let _filters = this.Filters.BuildFiltersToSend();

        /**
         * TODO
         * Need to be refactored
         * That part of code was copied from old place
         */
        if(this.page === 'enterprises' || this.page === 'currentpurchases') {
            if (page === 'currentpurchases') {
                page = 'enterprises';
            }
            this.Charts.Get(page, _filters).then(
                charts => {
                    this.labels = [];
                    this.data = [];
                    this.babbleData = {};
                    this.indBar = [];

                    if (charts.data.summaryByRevenues.length >= 1) {
                        let dataDonught = charts.data.summaryByRevenues;
                        angular.forEach(dataDonught, (items, keyIndex) => {
                            const label = this.$filter('Capitalize')(items.name);

                            // prefix label with color+colon (@see #donutlableshack)
                            if (label.length < 15) {
                                this.labels.push(
                                    `${this.Charts.getColorByIndex(keyIndex)}:${this.$filter('Capitalize')(items.name)}`
                                );
                            } else {
                                this.labels.push(
                                    `${this.Charts.getColorByIndex(keyIndex)}:${label.substring(0, label.indexOf('lion'))}`
                                );
                            }

                            this.data.push(items.count);
                        });
                    }
                    if (charts.data.summaryByInstalls.length >= 1) {
                        this.babbleData = charts.data.summaryByInstalls;
                    }
                    if (charts.data.summaryByIndustries.length >= 1) {
                        let industries = charts.data.summaryByIndustries;

                        let maxNum = industries;
                        for (let i = 0; i < maxNum.length; i++) {
                            if (maxNum[i]['count'] > maxNum[0]['count']) {
                                maxNum[0] = maxNum[i];
                            }
                        }
                        let sum = maxNum[0]['count'];
                        const percentageCalc = (arr, sum) => {
                            arr.forEach((item, key) => {
                                let m = item.count / sum * 100;
                                let i = {};
                                i.size = m;
                                i.count = item.count;
                                i.names = item.name;
                                i.color = getColor(key);
                                this.indBar.push(i);
                            });
                        }
                        percentageCalc(industries, sum);
                    }
                    function getColor(key) {
                        let colors = [
                            {
                                color: "#cc0023"
                            }, {
                                color: "#fb7d47"
                            }, {
                                color: "#125256"
                            }, {
                                color: "#f2c428"
                            }, {
                                color: "#b9ea8a"
                            }, {
                                color: "#29bcb3"
                            }, {
                                color: "#cc0023"
                            }, {
                                color: "#fb7d47"
                            }, {
                                color: "#125256"
                            }, {
                                color: "#f2c428"
                            }, {
                                color: "#b9ea8a"
                            }, {
                                color: "#29bcb3"
                            },
                        ];
                        return colors[key].color;
                    }

                    this.options = this.Charts.GetOptions();

                    // Charts are finished loading
                    this.Charts.SetLoadingStatus(false);

                    this.runLastGetChartsCallbackPending();

                }, (error) => {
                    this.$log.error('Error when getting charts data.');
                    this.$log.error(error);
                }
            );
        } else if(this.page === 'contacts') {

            this.ChartsSpinner = true;
            this.selectedRegion = {
                eu: {
                    'active': ''
                },
                us: {
                    'active': 'active'
                },
                ca: {
                    'active': ''
                }
            };

            this.Charts.Get(page, _filters).then((response) => {
                this.labelsRevenue = [];
                this.optionsManagementLevels = this.Charts.GetOptions('chart-management-levels');
                this.optionsAccountRevenue = this.Charts.GetOptions('chart-account-revenue-in-us-dollars');
                this.dataRevenue = [];
                this.labelsML = [];
                this.dataMengLevel = [];

                if (response.data.summaryByRevenue.length >= 1) {
                    let dataDonught = response.data.summaryByRevenue;
                    angular.forEach(dataDonught, (items, keyIndex) => {
                        let label = this.$filter('Capitalize')(items.name);

                        // prefix label with color+colon (@see #donutlableshack)
                        if (label.length < 15) {
                            this.labelsRevenue.push(`${this.Charts.getColorByIndex(keyIndex)}:${this.$filter('Capitalize')(items.name)}`);
                        } else {
                            this.labelsRevenue.push(`${this.Charts.getColorByIndex(keyIndex)}:${label.substring(0, label.indexOf('lion'))}`);
                        }

                        this.dataRevenue.push(items.count);
                    });
                }
                if (response.data.summaryByManagementLevel.length >= 1) {
                    let plsScore = response.data.summaryByManagementLevel;
                    angular.forEach(plsScore, (items, keyIndex) => {
                        // prefix label with color+colon (@see #donutlableshack)
                        this.labelsML.push(`${this.Charts.getColorByIndex(keyIndex)}:${items.name}`);
                        this.dataMengLevel.push(parseInt(items.count));
                    });
                }

                if (response.data.summaryForUSA.length >= 1 || response.data.summaryForCanada.length >= 1) {
                    let abbr, getUsRegionData, getCanRegionData;
                        this.mapDataUS = [['State', 'Contacts']];
                        this.mapDataCan = [['State', 'Contacts']];

                    getUsRegionData = response.data.summaryForUSA;
                    getCanRegionData = response.data.summaryForCanada;
                    angular.forEach(getUsRegionData, (item) => {
                        abbr = '';
                        let name = abbr + this.$filter('uppercase')(item.name);
                        this.mapDataUS.push([name, item.count]);
                    });
                    angular.forEach(getCanRegionData, (item) => {
                        abbr = 'CA-';
                        let name = abbr + this.$filter('uppercase')(item.name);
                        this.mapDataCan.push([name, item.count]);
                    });
                    // this.drawRegionsMap();
                }
                if (response.data.summaryForEurope.length >= 1) {
                    let getEURegiondata = response.data.summaryForEurope;
                    this.mapDataEU = [
                        ['Country', 'Contacts']
                    ];
                    angular.forEach(getEURegiondata, (item) => {
                        this.mapDataEU.push([item.name, item.count]);
                    });
                }

                if (this.locationSelected('Canada', 'Countries')) {
                    this.choseC('Canada');
                } else if (this.locationSelected('North America', 'Continents')) {
                    this.choseC('USA');
                } else if (this.locationSelected('Europe', 'Continents')) {
                    this.choseC('EU');
                } else {
                    this.choseC('USA');
                }

                this.ChartsSpinner = false;

                // Charts are finished loading
                this.Charts.SetLoadingStatus(false);

                this.runLastGetChartsCallbackPending();
            });
        }
    }

    drawEuMap() {
        let data = google.visualization.arrayToDataTable(this.mapDataEU);

        let options = {
            region: '150',
            colorAxis: {colors: ['#f6e736', '#cc0023']},
            legend: 'none'
        };

        let chart = new google.visualization.GeoChart(document.getElementById('geochart-colors'));
        chart.draw(data, options);
    }

    locationSelected(what, where){
        let selectedStuff, verdict = false, index;

        switch (where) {
            case 'Continents': {
                if (this._continentsLoading) {
                    return;
                }

                this.GetContinents()
                    .then((continents) => {
                        selectedStuff = continents;
                        switch (what) {
                            case 'Europe':
                                what = '3';
                                break;
                            case 'North America':
                                what = '4';
                                break; //trailing break
                        }
                        let val;
                        index = 0;
                        for (index in selectedStuff) {
                            val = selectedStuff[index];
                            if (val === what) {
                                verdict = true;
                                break;
                            }
                        }
                        return verdict;
                    });

                break;
            }
            default: {

                if(this._countriesLoading) {
                    return;
                }
                where = 'Countries';

                this.GetCountries()
                    .then((countries) => {
                        selectedStuff = countries;
                        let obj;
                        index = 0;
                        for (index in selectedStuff) {
                            obj = selectedStuff[index];
                            if (obj.hasOwnProperty("channel") && obj.channel === String(what)) {
                                verdict = true;
                                break;
                            }
                        }
                        return verdict;
                    });

            }
        }

    }

    choseC(region) {
        this.selectedRegion.eu.active = '';
        this.selectedRegion.us.active = '';
        this.selectedRegion.ca.active = '';
        if (this.locationSelected('Canada', 'Countries') || region === 'Canada') {
            this.selectedRegion.ca.active = 'active';
            this.drawRegionsMap()
        } else if (region === 'EU') {
            this.selectedRegion.eu.active = 'active';
            this.drawEuMap();
        } else {
            this.selectedRegion.us.active = 'active';
            this.drawRegionsMap()
        }
    }

    drawRegionsMap() {
        let options;
        if (this.locationSelected('Canada', 'Countries') || this.selectedRegion.ca.active == 'active') {
            if (this.mapDataCan && this.mapDataCan.length) {
                let data = google.visualization.arrayToDataTable(this.mapDataCan);
                options = {
                    region: 'CA',
                    colorAxis: {colors: ['#f6e736', '#cc0023']},
                    legend: 'none',
                    resolution: 'provinces'
                };

                let _element = document.getElementById('geochart-colors');
                if (_element) {
                    let chart = new google.visualization.GeoChart(_element);
                    chart.draw(data, options);
                }
            }
        } else {
            if (this.mapDataUS && this.mapDataUS.length) {
                let data = google.visualization.arrayToDataTable(this.mapDataUS);
                options = {
                    region: 'US',
                    colorAxis: {colors: ['#f6e736', '#cc0023']},
                    legend: 'none',
                    resolution: 'provinces'
                };

                let _element = document.getElementById('geochart-colors');
                if (_element) {
                    let chart = new google.visualization.GeoChart(_element);
                    chart.draw(data, options);
                }

                return;
            }

            if (this.mapDataEU && this.mapDataEU.length) {
                this.choseC('EU');
                this.drawEuMap();
            }
        }
    }

    /**
     * Check if charts are loading
     * @returns {boolean}
     * @constructor
     */
    IsLoading() {
        return this.Charts.IsLoading();
    }

    $onDestroy() {
        this.unregisterUpdateChartsListener();

        // just in case...
        this._lastGetChartsCallbackPending = null;
    }

    runLastGetChartsCallbackPending() {
        if (this._lastGetChartsCallbackPending) {
            this._lastGetChartsCallbackPending();
            this._lastGetChartsCallbackPending = null;
        }
    }
}

export default ChartsController;
