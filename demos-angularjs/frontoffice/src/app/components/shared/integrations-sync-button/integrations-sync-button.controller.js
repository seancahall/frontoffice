class IntegrationsSyncButtonController {
    /** @ngInject */
    constructor(Integration) {
        this.Integration = Integration;

        this.canSyncBeSet = this.canSyncBeSet.bind(this);
    }

    $onInit() {
        if(this.justifyContent !== 'space-between') {
            this.justifyContent = 'start';
        }

        this.crmSyncStatus = Number(this.crmSyncStatus);

        if(isNaN(this.crmSyncStatus)) {
            this.crmSyncStatus = 0;
        }
    }

    toggleSync() {
        this.doSync = !this.doSync;
    }

    canSyncBeSet() {
        return this.canCrmExportEnabled && this.Integration.canSyncBeSet(this.crmSyncStatus);
    }
}

export default IntegrationsSyncButtonController;