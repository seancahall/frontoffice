class ContentBundleController {
    constructor($scope, AppHelper, Content) {
        this.$scope = $scope;
        this.AppHelper = AppHelper;
        this.Content = Content;
    }

    $onInit() {
        this.showVideoPopup = this.$scope.$parent.showVideoPopup;
        this.openBundleInfo = this.$scope.$parent.openBundleInfo;
        this.announceClick = this.$scope.$parent.announceClick;
        this.DOWNLOAD_UNLOCKED_TYPE = 'unlocked';
        this.DOWNLOAD_LOCKED_TYPE = 'locked';

        this.menuList = [
            {name: 'Unlocked PDF so you can extract portions for your own content', type: this.DOWNLOAD_UNLOCKED_TYPE},
            {name: 'Locked PDF for use as a content offer', type: this.DOWNLOAD_LOCKED_TYPE},
        ];

        this.content = this.data;
    }

    $onChanges() {
        this.isiOSMobileDevice = this.AppHelper.isiOSMobileDevice();
        this.content = this.data;
        this.researchBiteTextClass = this.getRbClass(this.content, 'bundle');       
        this.detailClass = this.getRbClass(this.content, 'detail');
    }

    getRbClass(content, classToApply) {
        let biteClass = '';
        let backgroundColors = _.shuffle([
            'green-text-bite',
            'magenta-text-bite',
            'purple-text-bite',
            'orange-text-bite',
            'yellow-text-bite',
            'blue-text-bite'
       ]);
        if (angular.isObject(content) && angular.isString(content.contentText)) {
            if (classToApply === 'bundle') {
                if (content.contentText.split(" ").length > 20) {
                    biteClass = 'large-text-bite-bundle ';
                } else if (content.contentText.split(" ").length > 15 && content.contentText.split(" ").length <= 20) {
                    biteClass =  'medium-text-bite-bundle ';
                } else if (content.contentText.split(" ").length <= 15) {
                    biteClass =  'small-text-bite-bundle ';
                }
            } else {
                if (content.contentText.split(" ").length > 20) {
                    biteClass =  'large-text-bite-detail ';
                } else if (content.contentText.split(" ").length > 15 && content.contentText.split(" ").length <= 20) {
                    biteClass =  'medium-text-bite ';
                } else if (content.contentText.split(" ").length <= 15) {
                    biteClass =  'small-text-bite-detail ';
                }
            }
        }

        return biteClass + backgroundColors[Math.floor(Math.random()*backgroundColors.length)];
    }

    isVideoType(contentGet) {
        return this.Content.IsVideoType(contentGet);
    }

    isSocialTilesType(contentGet) {
        return this.Content.IsSocialTilesType(contentGet);
    }
}
ContentBundleController.$inject = ['$scope', 'AppHelper', 'Content'];

export default ContentBundleController;