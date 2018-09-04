class LocationHeatMapController {
    constructor($rootScope, LocationHeatMap, Filters, $timeout, $filter, Markets) {
        this.$rootScope = $rootScope;
        this.LocationHeatMap = LocationHeatMap;
        this.Filters = Filters;
        this.$timeout = $timeout;
        this.$filter = $filter;
        this.Markets = Markets;

        this.continents = this.LocationHeatMap.GetSupportedContinent();
        this.selectedContinent = this.LocationHeatMap.GetSelectedContinent();
        /**
         * Define local variables
         * @type {{}}
         */
        this._marketObjectsName = 'Accounts';
        this._areaName = 'State';

        this.currentCoordinates = this.continents[this.selectedContinent].center;
        this.chart = null;
        this.market = 'enterprise';
        this.zoomLevel = 0;
        this.pointRadius = 40;
        this._tooltipSelector = null;
        this._statesColors = [];
        this._flattenZoomArray = [];
        this._chart = null;
    }

    $onInit() {
        this.unsubscribeMarketChanged = this.$rootScope.$on('MARKET_CHANGED', (event, market) => {
            this.market = market;
            this._marketObjectsName = this.market === 'enterprise' ? 'Accounts' : 'Sites';
            this.zoomLevel = 0;
            if (this._chart) {
                this._chart.zoom();
            }
            $('#location-heat-map').unbind();
            this.init();
        });

        this.init();

        this.unsubscribeUpdateFilters = this.$rootScope.$on('UPDATE_FILTERS', () => {
            this.init();
            this.zoomLevel = 0;
            if (this._chart) {
                this._chart.zoom();
            }
            $('#location-heat-map').unbind();
        });
    }

    $onDestroy() {
        if(this.unsubscribeUpdateFilters) {
            this.unsubscribeMarketChanged();
            this.unsubscribeUpdateFilters();
        }
    }

    SelectContinent(continent) {
        this._tooltipSelector.unbind();
        this.LocationHeatMap.SetSelectedContinent(continent);
        this.selectedContinent = continent;
        this._areaName = this.selectedContinent === 'custom/europe' ? 'Country' : 'State';
        this.zoomLevel = 0;
        if (this._chart) {
            this._chart.zoom();
        }
        $('#location-heat-map').unbind();
        this.init();
    }

    // Move to service
    init() {
        this.isLoading = true;

        this.Markets.getInitialGeoZoom(this.market, this.Filters.BuildFiltersToSend())
            .then((response) => {
                var _countries = _.filter(response.data.data, (continent, key) => {
                    return this.LocationHeatMap.GetContinentDetails(this.selectedContinent).continents.indexOf(parseInt(key)) > -1;
                })[0];

                this._statesColors = [];

                this.isLoading = false;

                // Iterate trough each found country
                _.each(_countries, (countryAreasData, countryName) => {
                    /**
                     * USA and Canada contains many areas data - each area represents states
                     * European country contains only one area data - it represents whole country
                     * let's iterate trough them BUT for 'custom/usa-and-canada' s show only data for Canada
                     */
                    if (countryName !== 'usa' || this.selectedContinent !== 'custom/usa-and-canada') {
                        _.each(countryAreasData, (areaData) => {
                            // Push valid object to data array
                            this._statesColors.push({
                                code: this.selectedContinent === 'custom/europe' ?
                                    this.LocationHeatMap.getIsoCodeByCountryName(countryName) :
                                    areaData.entity.toUpperCase(),
                                value: areaData.count,
                                formattedValue: this.$filter('number')(areaData.count),
                                distribution: areaData.distribution
                            });
                        });
                    }
                });

                if (this._chart) {
                    try {
                        this._chart.destroy();
                    } catch (e) {
                        // sometimes it fails - do not do anything here - for now
                    }
                }

                /**
                 * VERSION4-3479
                 *
                 * check if container actually exists - in case users has navigated to other page, container is not present
                 * if container is not present, then we cannot continue
                 * Highcharts throws 'error #13' if run on not-existent element ID
                 */
                if ($('#location-heat-map').length < 1) {
                    return;
                }

                this._chart = Highcharts.mapChart('location-heat-map', {
                    chart: {
                        map: this.selectedContinent,
                        height: 620
                    },

                    credits: {
                        enabled: false
                    },

                    legend: {
                        enabled: false
                    },

                    mapNavigation: {
                        enabled: false
                    },

                    navigation: {
                        buttonOptions: {
                            align: 'right',
                            enabled: false
                        }
                    },

                    plotOptions: {
                        series: {
                            turboThreshold: 3000
                        }
                    },

                    colorAxis: {
                        min: 1,
                        type: 'linear',
                        minColor: '#ffdb00',
                        maxColor: '#d0021b',
                        stops: [
                            [0, '#ffdb00'],
                            [0.5, '#ff7f3f'],
                            [1, '#d0021b']
                        ]
                    },
                    title: {
                        text: ''
                    },
                    tooltip: {
                        useHTML: true,
                        style: {
                            pointerEvents: 'auto'
                        }
                    },
                    series: [{
                        data: this._statesColors,
                        joinBy: this.selectedContinent === 'custom/europe' ? ['iso-a2', 'code'] : ['postal-code', 'code'],
                        dataLabels: {
                            enabled: true,
                            color: '#FFFFFF',
                            format: '{point.formattedValue}',
                            style: {
                                textOutline: '0'
                            }
                        },
                        tooltip: {
                            followPointer: false,
                            headerFormat: '<b>' + this._areaName + ':</b> {point.key}<br/> ',
                            pointFormat: '<b>Total ' + this._marketObjectsName + ':</b> {point.formattedValue} <br/><b>Total Distribution: {point.distribution}%</b><br/><b class="tooltip-selector clickable" data-point="{point.code}">SELECT</b>',
                            useHTML: true
                        }
                    }]
                });

                // Walk around for Sprint13
                this._tooltipSelector = $('body').on('click', '.tooltip-selector', (e) => {
                    var _clicked = this.LocationHeatMap.GetMappedyCode(e.currentTarget.dataset.point, this._areaName === 'Country' ? 'C' : 'S');
                    this.Filters.updateMultiSelectFilter('location', this._areaName === 'Country' ? 'countryIds' : 'stateIds', 'id', _clicked.id, true, true);
                });

            });
    }
}
LocationHeatMapController.$inject = ['$rootScope', 'LocationHeatMap', 'Filters', '$timeout', '$filter', 'Markets'];

export default LocationHeatMapController;
