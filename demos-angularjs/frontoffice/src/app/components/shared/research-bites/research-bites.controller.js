class ResearchBites {
    constructor(Content, AppHelper, $state) {
        this.Content = Content;
        this.AppHelper = AppHelper;
        this.$state = $state;
    }

    // for some reason (latency perhaps) the data only loads on this event
    $onChanges() {
        this.researchBitesSort = this.data;
        this.mediumBiteColor = this.getBackgroundColor('medium');
        this.smallBiteColor = this.getBackgroundColor('small');
        this.largeBiteColor = this.getBackgroundColor('large'); 
    }

    openBundleInfo(content) {
        this.$state.go('app.content.id', { id: content.contentId });
    }

    announceClick(item, content, doDownload) {
        this.contentParent.announceClick(item, content, doDownload);
    }

    gridViewDownload(contentType, content) {
        this.contentParent.gridViewDownload(contentType, content);
    }

    copyDone(content) {
        this.contentParent.copyDone(content);
    }

    isCopyAllowed() {
        return this.AppHelper.isCopyAllowed();
    }

    isVideoType(content) {
        return this.Content.IsVideoType(content);
    }

    isSocialTilesType(content) {
        return this.Content.IsSocialTilesType(content);
    }

    getBackgroundColor(size) {
        
        let backgroundColors = _.shuffle([
            'green-text-bite',
            'magenta-text-bite',
            'purple-text-bite',
            'orange-text-bite',
            'yellow-text-bite',
            'blue-text-bite'
        ]);

        // these are the default background colors which are unique to each size
        if (size === 'medium') {         
            backgroundColors.push('turquoise-text-bite');
        } else if(size === 'small') {
            backgroundColors.push('slate-text-bite');
        } else {
            backgroundColors.push('grey-text-bite');
        }
        return backgroundColors[Math.floor(Math.random()*backgroundColors.length)];
    }

}
ResearchBites.$inject = ['Content', 'AppHelper', '$state'];

export default ResearchBites;