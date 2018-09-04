class BulkActionsMenuController {
    constructor(Integrations, SaveCSV, $state, AppHelper, AllowedCounts, ExportCrm, User, $rootScope, Filters, ResultSelection) {
        this.Integration = Integrations;
        this.SaveCSV = SaveCSV;
        this.$state = $state;
        this.AppHelper = AppHelper;
        this.AllowedCounts = AllowedCounts;
        this.ExportCrm = ExportCrm;
        this.User = User;
        this.$rootScope = $rootScope;
        this.Filters = Filters;
        this.ResultSelection = ResultSelection;

        this.showSaveQueryDialog = this.showSaveQueryDialog.bind(this);
    }

    $onInit() {
        this.unsubscribeQueryLoaded = this.$rootScope.$on('QUERY_LOADED', (event, query) => {
            // for now we'll use the first element in an array to determine menu options
            if (query.length) {
                this.query = query[0];
            } else {
                this.query = query;
            }
        });

        this.unsubscribeFiltersResetAllRangeElements = this.$rootScope.$on(
            'FILTERS_RESET_ALL_RANGE_ELEMENTS',
            () => this.query = null
        );

        // Map for bulk actions strings
        // Two states of strings available
        this.strings = {
            'default': {
                'export': 'Export as CSV File',
                save: 'Save As New Query',
                generate: 'Generate Count Report',
                exportToCrm: 'Export to CRM'
            },
            'selected': {
                'export': 'Export Selected to CSV File',
                save: 'Save Selected Query',
                generate: 'Generate Count Report for Selected',
                exportToCrm: 'Export Selected to CRM'
            }
        };
    }

    $onDestroy() {
        this.unsubscribeQueryLoaded();
        this.unsubscribeFiltersResetAllRangeElements();
    }

    exportToSalesForceOptionEnabled() {
        /**
         * Bulk export need to be hidden/disabled on 'technology-installs' and it is 'cpurchases' state
         * even if integration is set
         */
        return this.Integration.isIntegrationsEnabled() &&
            this.Integration.isConnectedToSalesForceInstance() &&
            this.User.CanExportSearchTypeToCrm('all') &&
            this.ExportCrm.getCrmExportEnabledSettings().canCrmExportEnabled;
    }

    showExportCSVDialog() {
        this._showExportDialogWithWarningIfNeeded(
            () => this.SaveCSV.showExportDialog()
        );
    }

    showSaveQueryDialog() {
        this.AllowedCounts.Fetch()
            .then(() => {
                if (this.AllowedCounts.Get().allowedSavedQueriesCount === -1 ||
                    (this.AllowedCounts.Get().allowedSavedQueriesCount - this.AllowedCounts.Get().savedQueriesCount) > 0
                ) {

                    let dialogSettings ={
                        component: 'save-query-modal',
                        resolve: {
                            isSave: true
                        }
                    }
                    this.AppHelper.openDialog(dialogSettings);
                } else {
                   this.AppHelper.openTextModal({
                       error: true,
                       message: '<h4>Information</h4>\n' +
                                '<p>The query you are saving exceeds the maximum allotted number you can save with this account.</p>\n' +
                                '<p>Please contact us at leadessentials@aberdeen.com to upgrade.</p>'
                   })
                }
            });
    }

    showUpdateQueryDialog() {
        this.AppHelper.openDialog({
            component: 'save-query-modal',
            resolve:{
                data: this.query
            }
        })
    }

    showGenerateCountDialog() {
        this.AppHelper.openDialog({
            template: '<generate-count-report-modal></generate-count-report-modal>'
        });
    }

    showBulkExportToSalesForceDialog() {
        this._showExportDialogWithWarningIfNeeded(
            () => this.Integration.showBulkExportDialog()
        );
    }

    /**
     * Check if row selection used
     * @returns {*}
     * @constructor
     */
    IsRowSelectionUsed() {
        return this.ResultSelection.IsRowSelectionUsed() ? 'selected' : 'default';
    }

    /**
     * Get option name
     * @param key
     * @returns {*}
     * @constructor
     */
    GetName(key) {
        return this.strings[this.IsRowSelectionUsed()][key];
    }

    /**
     * Shows export dialog
     * If needed, warning dialog is displayed before showing export dialog
     *
     * VERSION4-3767 VERSION4-3775 VERSION4-3870 VERSION4-3875
     *
     * @param exportCallback
     * @private
     */
    _showExportDialogWithWarningIfNeeded(exportCallback) {
        const _currentFilters = this.Filters.getCurrentFilters();
        const _contactEmailTypeOptions = this.Filters.GetFilterOptions('contact', 'contactEmailType');

        /**
         * VERSION4-3767 VERSION4-3870
         *
         * Run export directly without showing additional dialog with warning, if:
         * - 'Email Filter' (contact.contactSearchType) is set to 'Without email address' ('withoutemail')
         * - or 'Email Verification' is set to 'valid only'
         *
         * otherwise show dialog with warning message before running the export
         */
        if (_currentFilters.contact.contactSearchType === 'withoutemail' ||
            _currentFilters.contact.contactEmailType && +_currentFilters.contact.contactEmailType === _contactEmailTypeOptions.validOnlyId
        ) {
            exportCallback();
        } else {
            this.AppHelper.showProcessInfoDialog(
                // callback to call on init
                _processInfoModal => {
                    _processInfoModal.isProcessing = false;
                    _processInfoModal.message = 'You have selected to include catchall emails in your export. These emails may have a higher bounce rate than the valid emails.';
                    _processInfoModal.messageType = 'warning';

                    _processInfoModal.button1Text = 'I understand';
                    _processInfoModal.button2Text = '';

                    // #modalclosing prevent closing dialog when remove is running
                    this.AppHelper.setOnModalClosingListener(_processInfoModal.$scope, _processInfoModal, 'isProcessing');

                    _processInfoModal.button1Callback = function() {
                        _processInfoModal.message = '';
                        _processInfoModal.button1Text = '';

                        _processInfoModal.button1Callback = angular.noop;

                        // show the export dialog
                        exportCallback();
                    };
                },
                // allow closing popup with escape/click
                true
            );
        }
    }
}
BulkActionsMenuController.$inject = ['Integration', 'SaveCSV', '$state', 'AppHelper', 'AllowedCounts', 'ExportCrm', 'User', '$rootScope', 'Filters', 'ResultSelection'];

export default BulkActionsMenuController;