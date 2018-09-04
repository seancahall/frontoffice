class HeaderController {
    constructor($rootScope, $scope, $window, $state, Header, Cache, Counts, AllowedCounts, Filters, $localStorage, Impersonation, Integration, $filter, Authorization, User) {
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$window = $window;
        this.$state = $state;
        this.Header = Header;
        this.Cache = Cache;
        this.Counts = Counts;
        this.AllowedCounts = AllowedCounts;
        this.Filters = Filters;

        // Create service for $localStorage
        this.$localStorage = $localStorage;

        this.Impersonation = Impersonation;
        this.Integration = Integration;
        this.$filter = $filter;
        this.Authorization = Authorization;
        this.User = User;

        this.menu = [
            { name: 'Home', state: 'app.home', visible: true },
            { name: 'Markets', state: 'app.markets', visible: true },
            { name: 'Accounts', state: 'app.accounts', visible: true },
            { name: 'Contacts', state: 'app.contacts', visible: true },
            { name: 'Technology installs', state: 'app.cpurchases', visible: true },
            { name: 'Content', state: 'app.content', visible: true },
            { name: 'Files', state: 'app.files', visible: true },
            { name: 'Users', state: 'app.users', visible: false },
        ];

        this.collapsed = true;
    }

    $onInit() {
        this.UpdateUserDetails();

        this.$rootScope.$on('USER_DATA_UPDATED', () => {
            this.menu[7].visible = this.User.IsInternalBackofficeUser();
        });

        this.$rootScope.$on('COUNTS_UPDATED', (event, data) => {
            this.countsButton = data.summaries && data.summaries.length ? 'UPDATE RESULTS' : 'NO RESULTS';
            this.countsValue = data.totalResultsCount;
        });

        this.$rootScope.$on('FILTERS_CHANGED', () => {
            this.countsButton = 'UPDATE RESULTS';
        });

        this.$rootScope.$on('IMPERSONATION_ENABLED', () => {
            /**
             * VERSION4-2755 clear/reset applyDefaultMarkets on impersonation
             *
             * related to VERSION4-2425 VERSION4-2067
             */
            this.$localStorage.applyDefaultMarkets = null;
        });

        this.$rootScope.$on('UPDATE_USER_DATA', (_emittedEvent, _callback) => {
            this.AllowedCounts.Fetch()
                .then(() => {
                    if (angular.isFunction(_callback)) {
                        _callback();
                    }
                });
        });

        this.$rootScope.$on('ALLOWED_COUNTS_LOADED', () => {
            this.UpdateUserDetails();
        });

        this.$rootScope.$on('USER_DATA_UPDATED', () => {
            this.UpdateUserDetails();

            if (typeof this.$localStorage.applyDefaultMarkets === 'undefined') {
                this.$localStorage.applyDefaultMarkets = null;
            }

            const _user = this.User.Get();

            /**
             * VERSION4-2425 VERSION4-2067
             *
             * after login userRoleService is initiated and 'USER_DATA_UPDATED' emitted
             * so if we are here and we have user data, then we can store default markets/channels
             */
            if (angular.isObject(_user) && _user.userId && this.$localStorage.applyDefaultMarkets === null) {
                if (angular.isArray(_user.defaultChannels) && _user.defaultChannels.length > 0) {
                    this.$localStorage.applyDefaultMarkets = _user.defaultChannels.map(
                        _market => ({ id: String(_market.id), name: _market.name })
                    );

                    this.$rootScope.$emit('APPLY_DEFAULT_MARKETS');
                } else {
                    // make it empty array here - do not make it null
                    this.$localStorage.applyDefaultMarkets = [];
                }
            }
        });

        this.$rootScope.$on('BlurSpinner', () => {
            this.countsBlur = 'BlurSpinner';
        });

        this.$rootScope.$on('BlurSpinnerEnd', () => {
            this.countsBlur = '';
        });

        // Window scroll watcher
        $(this.$window).on('scroll', () => {

            // TODO
            // It should be done in service and as a $scope ng-class
            // But too much watchers and performance was bad
            let _sticky = window.pageYOffset > this.Header.GetStickyOffset();
            this.Header.SetSticky(_sticky);
            _sticky ? $('body').addClass('sticky-navigation') : $('body').removeClass('sticky-navigation');
            _sticky ? $('header.header-component').addClass('sticky') : $('header.header-component').removeClass('sticky');

        });
    }

    UpdateUserDetails() {
        const user = this.User.Get();
        if (user) {
            /**
             * for details about limits and records/content remaining, please check first comment in VERSION4-3009
             */
            let isContentToDownloadUnlimited = false;
            let isRecordsToDownloadUnlimited = false;

            if (this.AllowedCounts.Get()) {
                isContentToDownloadUnlimited = this.AllowedCounts.IsUnlimited('CURRENT_DOWNLOADED_CONTENTS_COUNT');
                isRecordsToDownloadUnlimited = this.AllowedCounts.IsUnlimited('ALLOWED_COMPANY_DOWNLOAD_RECORDS_COUNT');
            }

            this.userInfo = {
                remainingContentToDownload: isContentToDownloadUnlimited ?
                    'unlimited' :
                    (user.remainingContentToDownload ? this.$filter('number')(+user.remainingContentToDownload) : 0),
                remainingRecordsToDownload: isRecordsToDownloadUnlimited ?
                    'unlimited' :
                    (user.remainingRecordsToDownload ? this.$filter('number')(+user.remainingRecordsToDownload) : 0),
                numberofMarkets: user.numberofMarkets === -1 ?
                    'unlimited' :
                    (user.numberofMarkets ? +user.numberofMarkets : 0),
                fullUserName: user.firstName + ' ' + user.lastName + ' - ' + user.subscribedChannels.length + ' ' + this.User.GetRoleName(),
                isIntegrationsAdmin: user.isIntegrationsAdmin,
                isIntegrationsEnabled: user.isIntegrationsEnabled
            };
        } else {
            this.userInfo = {
                remainingContentToDownload: null,
                remainingRecordsToDownload: null,
                numberofMarkets: null,
                fullUserName: '',
                isIntegrationsAdmin: false,
                isIntegrationsEnabled: false
            };
        }
    }

    GetRole() {
        return this.User.GetRoleName();
    }

    IsSticky() {
        return this.Header.IsSticky();
    }

    IsLogged() {
        return this.Authorization.IsLogged();
    }

    ShowCounts() {
        return this.Counts.AreCountsAvailableInView(this.$state.$current.name);
    }

    OpenFeedbackChat() {
        this.$window.open('https://app.teamsupport.com/Chat/ChatInit.aspx?uid=77ed5cb9-7fc5-44e4-98bb-ccebbee8ad3e',
            'TSChat',
            'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,copyhistory=no,resizable=no,width=450,height=500');
    }

    IsInternalBackofficeUser() {
        return this.User.IsInternalBackofficeUser();
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
     * Method calling when user was able to update results, and click it
     * @constructor
     */
    Update() {
        this.Filters.Update();
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

    /**
     * Method calling from view, it will return valid button text to show
     * @returns {string}
     * @constructor
     */
    GetButtonText() {
        return this.Filters.GetButtonText();
    }

    Logout() {
        this.Authorization.Logout();
    }

    ClearCache() {
        this.Cache.Reset();
    }

    ReloadCache() {
        this.Cache.Reload();
    }

    IsImpersonated() {
        return this.Impersonation.GetImpersonationMode();
    }

    GetImpersonationUser() {
        return this.Authorization.GetImpersonatedUser();
    }

    SignOutImpersonated() {
        this.Authorization.ClearImpersonationSession();
        this.$window.close();
    }

    MenuTriggered() {
        // make it work only below 1050
        if ($(window).width() < 1050) {
            this.collapsed = !this.collapsed;
        }
    }

    showIntegrationsLink() {
        return this.Integration.isIntegrationsEnabled() && this.Integration.isIntegrationsAdmin();
    }
}
HeaderController.$inject = ['$rootScope', '$scope', '$window', '$state', 'Header', 'Cache', 'Counts', 'AllowedCounts', 'Filters', '$localStorage', 'Impersonation', 'Integration', '$filter', 'Authorization', 'User'];

export default HeaderController;
