class FlagDataController {
    constructor(AppHelper) {
        this.AppHelper = AppHelper;
    }

    openModal(e) {
        e.stopPropagation();

        this.AppHelper.openDialog({
            component: 'flag-data-modal',
            resolve: {
                params: () => {
                    return {
                        entityType: this.entityType.replace(/'+/g, ''),
                        entityId: this.entityId
                    };
                }
            }
        });
    }
}
FlagDataController.$inject = ['AppHelper'];

export default FlagDataController;