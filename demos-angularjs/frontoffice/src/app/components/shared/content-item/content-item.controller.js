class ContentItem {
    constructor(AppHelper, Content, $state, $filter) {
        this.AppHelper = AppHelper;
        this.Content = Content;
        this.$state = $state;
        this.$filter = $filter;
    }
    
    $onInit() {
        var DOWNLOAD_UNLOCKED_TYPE = 'unlocked';
        var DOWNLOAD_LOCKED_TYPE = 'locked';

        this.menuList = [
            {name: 'Unlocked PDF so you can extract portions for your own content', type: DOWNLOAD_UNLOCKED_TYPE},
            {name: 'Locked PDF for use as a content offer', type: DOWNLOAD_LOCKED_TYPE}
        ];
    }

    // for some reason the data only loads on this event
    $onChanges() {
        this.isiOSMobileDevice = this.AppHelper.isiOSMobileDevice();
        this.content = this.data;
        this.researchBiteTextClass = this.getRbClass(this.content);
        // if(this.content && this.content.contentTypeId === 17) {
        //     this.copyContent = this.content.contentText + ' Source: Aberdeen, ' + this.$filter('date')( this.content.publishedDate, "MMMM") + ', ' + this.$filter('date')( this.content.publishedDate, "yyyy");
        // }
    }

    announceClick(item, content, doDownload) {
        this.researchBitesParent.announceClick(item, content, doDownload);
    }

    gridViewDownload(contentType, content) {
        this.researchBitesParent.gridViewDownload(contentType, content);
    }

    openBundleInfo(content) {
        this.$state.go('app.contentDetails', {id: content.contentId});
    }

    isVideoType(content) {
        return this.Content.IsVideoType(content);
    }

    isSocialTilesType(content) {
        return this.Content.IsSocialTilesType(content);
    }

    isCopyAllowed() {
        return this.AppHelper.isCopyAllowed();
    }

    copyDone(content) {
        this.researchBitesParent.copyDone(content);
    }

    getDefaultImage() {
        return '/assets/images/image-bite-default.png';
    }

    getRbClass(content) {
        if (angular.isObject(content) && angular.isString(content.contentText)) {
            if (content.contentText.split(" ").length <= 15) {
                return 'small-text-bite-hover';
            } else if (content.contentText.split(" ").length > 26) {
                return 'extra-large-text-bite';
            } 
        }
        return '';
    }

    getIconMargin(content) {
        if (angular.isObject(content) && angular.isString(content.contentText)) {         
            if (content.contentText.split(" ").length <= 15) {
                return 'small-bite-copy-icon';
            } else if (content.contentText.split(" ").length > 15 && content.contentText.split(" ").length <= 20) {
                return 'medium-bite-copy-icon';    
            } else {
                return 'copy-icon';
            }
        }
    }
}
ContentItem.$inject = ['AppHelper', 'Content', '$state'];

export default ContentItem;