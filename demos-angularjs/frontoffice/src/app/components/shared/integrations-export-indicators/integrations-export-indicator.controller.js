class IntegrationsExportIndicatorController {
    /** @ngInject */
    constructor(Integration) {
        this.Integration = Integration;
    }

    $onChanges() {
        this.hasBeenAlreadySentToSalesForce = this.Integration.hasBeenAlreadySentToSalesForce(this.externalSystems);
    }
}

export default IntegrationsExportIndicatorController;