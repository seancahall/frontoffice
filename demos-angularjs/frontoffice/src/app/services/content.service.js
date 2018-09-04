class Content {
    constructor(Rest, $rootScope) {
        this.Rest = Rest;
        this.$rootScope = $rootScope;
        this.CONTENT_TYPE_VIDEO_BRIEF = 9;
        this.CONTENT_TYPE_VIDEO_TEASER = 10;
    }

    /**
     * Get data for Technology Installs
     * @returns {*}
     * @constructor
     */
    Get(filters) {
        return this.Rest.Post('/api/content/search', filters);
    }

    /**
     * VERSION4-2490
     * Sent when user copies text from an illuminator - each copying needs to be registered
     *
     * @param contentId int
     * @returns {*}
     * @constructor
     */
    SaveRegisterContentDownload(contentId) {
        /**
         * VERSION4-2585 #content-file-download-triggered user data need to be reloaded
         */
        this.$rootScope.$emit('UPDATE_USER_DATA');

        return this.Rest.Get('/api/content/RegisterContentDownload?contentId=' + parseInt(contentId));
    }

    normalizeResearchBitesArray(content, sort) {
        const normalContent = {};
        normalContent.resultsCount = content.resultsCount;
        normalContent.totalResultsCount = content.totalResultsCount;
        normalContent.summaries = [];

        for (let i = 0; i < content.length; i++){
            normalContent.summaries.push(content[i].largeText);
            for (let x = 0; x < content[i].graph.length; x++) {
                normalContent.summaries.push(content[i].graph[x]);
            }
            normalContent.summaries.push(content[i].mediumText);
            for (let y = 0; y < content[i].otherTypes.length; y++) {
                normalContent.summaries.push(content[i].otherTypes[y]);
            }
            normalContent.summaries.push(content[i].smallText);
        }
        // if no sort is passed return unordered, this should only happen when toggling from research bites view to list view
        if(sort){
            return this.sortListView(normalContent, sort);
        } else {
            return normalContent;
        }
    }

    sortListView(content, sort) {
        // handle alpha, date and numeric sort across 5 columns
        if(sort && sort.by.toLowerCase() === 'publishdate'){
            content.summaries.sort(function(a, b){
                const dateA = new Date(a.publishedDate), dateB = new Date(b.publishedDate);
                if(sort.direction === 'DESC') {
                    return dateA > dateB ? -1 : dateA < dateB ? 1 : 0;
                } else {
                    return dateA - dateB;
                }
            })
         } else if(sort && sort.by.toLowerCase() === 'contentid' || sort.by.toLowerCase() === 'numberofpiecesbundled'){
            content.summaries.sort(function(a, b){
                if(sort.by.toLowerCase() === 'contentid'){
                    if(sort.direction === 'DESC') {
                        return a.contentId - b.contentId;
                    } else {
                        return b.contentId - a.contentId;
                    }
                } else {
                    if(sort.direction === 'DESC') {
                        return a.numberOfPiecesBundled - b.numberOfPiecesBundled;
                    } else {
                        return b.numberOfPiecesBundled - a.numberOfPiecesBundled;
                    }
                }
            })
         } else if(sort && sort.by.toLowerCase() === 'title' || sort.by.toLowerCase() === 'contenttype'){
            content.summaries.sort(function(a, b){
                if(sort.by.toLowerCase() === 'title'){
                    const titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
                    if(sort.direction === 'DESC') {
                        if (titleA > titleB){
                            return -1;
                        }
                        if (titleA < titleB){ //sort string descending
                            return 1;
                        }
                        return 0; //default return value (no sorting)
                    } else {
                        if (titleA < titleB){ //sort string ascending
                            return -1;
                        }
                        if (titleA > titleB){
                            return 1;
                        }
                        return 0; //default return value (no sorting)
                    }
                } else {
                    const contentTypeA = a.contentType, contentTypeB = b.contentType;
                    if(sort.direction === 'DESC') {
                        if (contentTypeA > contentTypeB){
                            return -1;
                        }
                        if (contentTypeA < contentTypeB){ //sort string descending
                            return 1;
                        }
                        return 0; //default return value (no sorting)
                    } else {
                        if (contentTypeA < contentTypeB){ //sort string ascending
                            return -1;
                        }
                        if (contentTypeA > contentTypeB){
                            return 1;
                        }
                        return 0; //default return value (no sorting)
                    }
                }
            })
         }
         return content;
    }

    /**
     * Build Research Bites Array
     * Generate an array of 4 objects containing 48 research bites total
     * It should only be called for the default build of the content section
     *
     * @content
     */
    buildResearchBitesArray(content) {
        let researchBitesArray = [];
        if(content){
            while (content[0].summaries.length >= 1 && content[1].summaries.length >= 1 && content[2].summaries.length >= 1 && content[3].summaries.length >= 4 && content[4].summaries.length >= 5) {

                let researchBite = {};
                researchBite.graph = [];
                researchBite.otherTypes = [];

                // do text bites
                researchBite.smallText = content[0].summaries.splice(0,1);
                researchBite.smallText = researchBite.smallText[0];
                researchBite.mediumText = content[1].summaries.splice(0,1);
                researchBite.mediumText = researchBite.mediumText[0];
                researchBite.mediumText.isMediumText = true;
                researchBite.largeText = content[2].summaries.splice(0,1);
                researchBite.largeText = researchBite.largeText[0];

                // image bites
                researchBite.graph = researchBite.graph.concat(content[3].summaries.splice(0,4));

                // non research bites
                researchBite.otherTypes = researchBite.otherTypes.concat(content[4].summaries.splice(0,5));

                researchBitesArray.push(researchBite);
            }
        }
        return researchBitesArray;
    }

    getResearchBites(filters) {
        return this.Rest.Post('/api/content/home', filters);
    }

    IsVideoType(contentGet) {
        if (contentGet) {
            return [
                this.CONTENT_TYPE_VIDEO_BRIEF,
                this.CONTENT_TYPE_VIDEO_TEASER
            ].indexOf(contentGet.contentTypeId) != -1;
        }
        return false;
    }

    IsSocialTilesType(contentGet) {
        if (contentGet) {
            return [
                this.CONTENT_TYPE_SOCIAL_TILES
            ].indexOf(contentGet.contentTypeId) != -1;
        }
        return false;
    }

    flattenResearchBitesArray(content){
        let result = {};
        result.summaries = [];
        result.resultsCount = 0;
        result.totalResultsCount = 0;
        if(content.summaries && content.summaries.length){
            for(let i = 0; i < content.summaries.length; i++){
                if(content.summaries[i].summaries.length){
                    for(let x = 0; x < content.summaries[i].summaries.length; x++){
                        result.summaries.push(content.summaries[i].summaries[x]);
                    }
                }
            }
            if(content.totalResultsCount && content.resultsCount){
                result.totalResultsCount = content.totalResultsCount;
                result.resultsCount = content.resultsCount;
            }
        }
        return result;
    }
}
Content.$inject = ['Rest', '$rootScope'];

export default Content;