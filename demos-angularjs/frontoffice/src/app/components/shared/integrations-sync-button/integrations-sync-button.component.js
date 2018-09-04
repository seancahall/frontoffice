import template from './integrations-sync-button.template.html';
import controller from './integrations-sync-button.controller';

export default {
    template,
    controller,
    bindings: {
        canCrmExportEnabled: '<',

        doSync: '=',

        /**
         * 1: MatchesCrm: Red = data point does not exist in CRM
         * 2: PropertyNotInCrm: Yellow = data point does exist in CRM but has been updated since the last push
         * 3: UpdatedOnlyInCrm: Green = data point does exist in CRM and matches what is in the CRM
         */
        crmSyncStatus: '<',

        /**
         * start - place button right after transcluded element
         * left - place button at the left end of the line
         */
        containerCss: '<?'
    },
    transclude: true
};
