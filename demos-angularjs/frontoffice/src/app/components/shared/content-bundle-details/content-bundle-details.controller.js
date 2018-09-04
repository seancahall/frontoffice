class ContentBundleDetails {
    constructor(AppHelper, Content, $scope, $filter) {
        this.AppHelper = AppHelper;
        this.Content = Content;
        this.$scope = $scope;
        this.$filter = $filter;
    }
    
    $onInit() {
        
        this.DOWNLOAD_UNLOCKED_TYPE = 'unlocked';
        this.DOWNLOAD_LOCKED_TYPE = 'locked';

        this.menuList = [
            {name: 'Unlocked PDF so you can extract portions for your own content', type: this.DOWNLOAD_UNLOCKED_TYPE},
            {name: 'Locked PDF for use as a content offer', type: this.DOWNLOAD_LOCKED_TYPE},
        ];

        this.content = this.data;

        this.announceClick = this.$scope.$parent.announceClick;
        this.showVideoPopup = this.$scope.$parent.showVideoPopup;
        this.copyDone = this.$scope.$parent.copyDone;
        this.detailViewDownload = this.$scope.$parent.detailViewDownload;
    }

    $onChanges() {
        this.isiOSMobileDevice = this.AppHelper.isiOSMobileDevice();
        this.content = this.data;
        if(this.content && this.content.contentTypeId === 17) {
            this.copyContent = this.content.contentText + '  Source: Aberdeen, ' + this.$filter('date')( this.content.publishedDate, "MMMM") + ', ' + this.$filter('date')( this.content.publishedDate, "yyyy");
        }
        this.detailClass = this.getRbClass(this.content, 'detail');  
        if(this.content && this.content.contentChannels){
            this.contentChannels = this.content.contentChannels.map(obj => {
                if(obj.channelName !== 'All Data') return obj.channelName;
            }).join(', ');
            this.contentChannels = this.contentChannels.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        }
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
ContentBundleDetails.$inject = ['AppHelper', 'Content', '$scope', '$filter'];

export default ContentBundleDetails;