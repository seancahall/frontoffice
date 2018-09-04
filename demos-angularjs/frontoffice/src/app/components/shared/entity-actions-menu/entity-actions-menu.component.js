import template from './entity-actions-menu.template.html';
import controller from './entity-actions-menu.controller';

export default {
    template,
    controller,
    bindings: {
        /**
         * String {'link' || 'icon'}
         */
        entityType: '@',

        /**
         * number
         */
        entityId: '<',

        /**
         * boolean
         */
        canCrmExportEnabled: '<',

        /**
         * Array<String>
         *
         * available values:
         *  singleExportToSalesForce
         *  flag
         */
        options: '<',

        /**
         * Array<int> || undefined
         *
         * values are ids of integrated systems for which given entity has been exported already
         */
        externalSystems: '<',

        /**
         * {bool exportContactAsLead, bool exportFuturePurchaseAsLead, bool exportSiteAsAccount, bool dataIntegrationDupeProcessTypeId} || null
         */
        integrationsSettings: '<',

        /**
         * 'arrow-right-green' || 'button-send-to'
         */
        menuTrigger: '@',

        /**
         * String
         * routing state for view option
         */
        optionViewState: '<',

        /**
         * api/enterprises/{id} response
         * OR
         * api/sites/{id} response
         * OR
         * api/contacts/{id} response
         */
        objectDataToSync: '<?',

        /**
         * crmSyncStatus value for given entity
         * by default it is set to 0
         *
         */
        crmSyncStatus: '<?'
    },
};
