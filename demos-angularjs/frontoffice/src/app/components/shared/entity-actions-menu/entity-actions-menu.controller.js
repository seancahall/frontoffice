class EntityActionsMenu {
    constructor(Integration, $state, $rootScope, User, AppHelper, ExportCrmDupe) {
        this.Integration = Integration;
        this.$state = $state;
        this.$rootScope = $rootScope;
        this.User = User;
        this.AppHelper = AppHelper;
        this.ExportCrmDupe = ExportCrmDupe;

        this.singleExportToSalesForce = this.singleExportToSalesForce.bind(this);
    }

    $onInit() {
        if(!Array.isArray(this.options)) {
            this.options = [];
        }

        this.showFlagOption = this.options.indexOf('flag') !== -1;
        this.showViewOption = this.options.indexOf('view') !== -1 && this.optionViewState;

        // defaults
        this.singleExportToSalesforceLabel = 'Send to Salesforce';
        this.singleExportToSalesforceEnabled = true;

        this.salesforceIntegrationSettings = {};

        this.loadSalesforceIntegrationsSettings = this.loadSalesforceIntegrationsSettings.bind(this);

        this._user = this.User.Get();
        if(!this._user) {
            this.unregisterUserDataUpdated = this.$rootScope.$on(
                'USER_DATA_UPDATED',
                this.loadSalesforceIntegrationsSettings
            );
        } else {
            this.unregisterUserDataUpdated = () => {};
            this.loadSalesforceIntegrationsSettings();
        }
    }

    $doCheck() {
        if(this.canDataBeSynced()) {
            // data to sync are present - so let's show set label for sync and enable options
            this.singleExportToSalesforceLabel = 'Sync Selected Data To Salesforce';
            this.singleExportToSalesforceEnabled = true;
        } else if(this.Integration.hasBeenAlreadySentToSalesForce(this.externalSystems)) {
            // see VERSION4-3178 for rules description
            if(this.salesforceIntegrationSettings.dataIntegrationDupeProcessTypeId !== this.ExportCrmDupe.dataIntegrationDupeProcessTypeIdIgnore()) {
                this.singleExportToSalesforceLabel = 'Update Record in Salesforce';
                this.singleExportToSalesforceEnabled = true;
            } else {
                this.singleExportToSalesforceLabel = 'Send to Salesforce';
                this.singleExportToSalesforceEnabled = false;
            }
        } else {
            this.singleExportToSalesforceLabel = 'Send to Salesforce';
            this.singleExportToSalesforceEnabled = true;
        }
    }

    $onDestroy() {
        this.unregisterUserDataUpdated();
    }

    loadSalesforceIntegrationsSettings() {
        this.Integration.getSalesforceIntegrationSettings().then(
            response => this.salesforceIntegrationSettings = _.cloneDeep(response)
        );
    }

    /**
     * Returns TRUE if export to salesforce option(s) are available
     *
     * @return {boolean|*|string}
     */
    showSingleExportToSalesForceOption() {
        /**
         * we do not need to use isConnectedToSalesForceInstance() method here
         * because IF we are not connected to the instance THEN integrationsSettings IS NULL
         */
        return this.options.indexOf('singleExportToSalesForce') !== -1 &&
            this.Integration.isIntegrationsEnabled() &&
            this.salesforceIntegrationSettings &&
            this.salesforceIntegrationSettings.dataIntegrationDupeProcessTypeId &&
            this.User.CanExportSearchTypeToCrm(this.entityType) &&
            this.canCrmExportEnabled;
    }

    /**
     * Returns TRUE if data can be synced
     *
     * @return {boolean|*}
     */
    canDataBeSynced() {
        return !_.isEmpty(this.objectDataToSync) && this.Integration.canSyncBeSet(this.crmSyncStatus);
    }

    onClickDisabled(e) {
        e.stopPropagation();
    }

    showMenu() {
        return this.showFlagOption || this.showViewOption || this.showSingleExportToSalesForceOption();
    }

    singleExportToSalesForce(forceSyncAll = false) {
        this.AppHelper.dismissAllDialogs();

        // let's run the export
        this.Integration.exportEntity(
            this.entityType === 'Account' ? 'Enterprise' : this.entityType,
            this.entityId,
            this.objectDataToSync,
            forceSyncAll
        );
    }

    showView() {
        let _url = this.$state.href(this.optionViewState, { id: this.entityId });
        window.open(_url,'_blank');
    }
}
EntityActionsMenu.$inject = ['Integration', '$state', '$rootScope', 'User', 'AppHelper', 'ExportCrmDupe'];

export default EntityActionsMenu;