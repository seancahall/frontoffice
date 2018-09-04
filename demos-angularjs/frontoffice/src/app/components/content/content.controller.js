class Content {
    constructor(Mixpanel, $scope, $rootScope, User, FileOperations, $stateParams, $state, $window, Filters, $log, Content, AppHelper, AllowedCounts, UserRole, Rest) {
        this.Mixpanel = Mixpanel;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.User = User;
        this.FileOperations = FileOperations;
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.$window = $window;
        this.Filters = Filters;
        this.$log = $log;
        this.Content = Content;
        this.AppHelper = AppHelper;
        this.AllowedCounts = AllowedCounts;
        this.UserRole = UserRole;
        this.Rest = Rest;

        this.stateScreen = this.stateScreen.bind(this);
    }

    $onInit() {
        /** Definitions **/
        this.showResearchBitesView = true;
        this.showListView = false;
        this.loading = false;
        this.pageSize = 48;
        this.isGrid = true;
        this.researchBitesArray = [];
        /**
         * this is updated in GetContent method
         * last result set to -1 means: API has not been called yet for start page
         */
        this._lastResultsCount = -1;

        /**
         * for API endpoint being used to load contents here, start page is 1
         */
        this._startPage = 1;

        /**
         * apply default filters set for company
         * for now only markets are applied
         */
        this.Filters.ApplyDefaultFilters();

        /**
         * Apply filters if stored into local storage
         */
        this.Filters.ApplyStoredFilters();

        /**
         * Set default paging for page
         * For Account page by default starting from page 0 and pageSize 25
         */
        this.initializePaging();

        /**
         * Set sorting for page
         * For Account page by default sorting:
         * @by: 'ITSpend'
         * @direction: 'DESC'
         */
        this.Filters.SetSorting(
            {
                by: 'PublishDate',
                direction: 'DESC'
            },
            {
                changeIfExist: false
            }
        );

        /**
         * Get filters
         * To be available on view before do something
         */
        this._filters = this.Filters.BuildFiltersToSend();

        /**
         * UPDATE_FILTERS Listener
         * It will refresh everything which is needed on that page
         * It will be fired when user hit 'Update Results' button in filter section
         */
        this.$rootScope.$on('UPDATE_FILTERS', (event, filters) => {
            this.ResetInfiniteScroll();
            this.GetContent(filters);
            this.showResearchBitesView = !filters.hasOwnProperty('content') && !this.showListView;
            this.$rootScope.$emit('UPDATE_COUNTS');
            this.$rootScope.$emit('UPDATE_CHARTS');
        });

        this.noResults = false;

        this.showSearchPanel = false;
        this.showHorizontalSearch = false;
        this.customContentDialog = false;
        this.showAboutBundle = false;
        this.usersPerPage = 9;
        this.infinite = false;
        this.bundleBreadcrumbs = false;
        this.breadcrumbs = [];

        this.contents = [];
        this.filtersData = '';

        this.DOWNLOAD_UNLOCKED_TYPE = 'unlocked';
        this.DOWNLOAD_LOCKED_TYPE = 'locked';

        this.menuList = [
            {name: 'Unlocked PDF so you can extract portions for your own content', type: this.DOWNLOAD_UNLOCKED_TYPE},
            {name: 'Locked PDF for use as a content offer', type: this.DOWNLOAD_LOCKED_TYPE}
        ];

        this.requestFileId = 0;
        this.requestNotes = "";

        this.pageType = '/api/content';
        this.listQueryTop = [];

        this.companysSort = {
            'PublishDate': 'ASC',
            'Title': 'def',
        };
        this.order = [
            'company'
        ];
        this.spinner = false;
        this.spinner_b = false;

        this.labels = [];
        this.series = ['1', '2'];

        this.colors = ["#134145", "#33b1a5"];
        this.options = {
            cutoutPercentage: "60",
            responsive: true,
            maintainAspectRatio: false
        };

        this.CONTENT_TYPE_VIDEO_BRIEF = 9;
        this.CONTENT_TYPE_VIDEO_TEASER = 10;
        this.CONTENT_TYPE_SOCIAL_TILES = 20;

        this.isiOSMobileDevice = this.AppHelper.isiOSMobileDevice();

        this.stateScreen();

        $(this.$window).on('resize', this.stateScreen);

        this._popoverForIndexOpened = false;

        this.close = function() {
            this._popoverForIndexOpened = false;
        };

        this.trialMode = () => this.User.IsTrialUser();

        // Get technology installs when enter the page
        this.GetContent(this._filters);

        /**
         * content info/details control the mask and button(s) on hover
         */
        this.unregisterThumbnailInfoWatcher = this.$scope.$watch(
            () => $('.content-thumbnails img').width(),
            newWidth => {
                $('.content-details-thumb .mask')
                    .width(newWidth + 'px')
                    .height($('.content-thumbnails img').height() + 'px');

                $('.content-details-thumb .hover-content')
                    .css('height', '100%')
                    .width(newWidth - (newWidth < 50 ? 0 : 36) + 'px');

                $('.content-details-thumb .hover-content-button')
                    .css('left', 0)
                    .css('width', newWidth - 10 + 'px');
            }
        );

        /**
         * @TODO-LE find some solution for it - get rid of that
         *
         * temporary workaround
         * to make 'content-bundle' and 'content-bundle-details'
         * components working with parent scope methods
         */
        this.$scope.announceClick = this.announceClick.bind(this);
        this.$scope.showVideoPopup = this.showVideoPopup.bind(this);
        this.$scope.openBundleInfo = this.openBundleInfo.bind(this);
        this.$scope.copyDone = this.copyDone.bind(this);
        this.$scope.detailViewDownload = this.detailViewDownload.bind(this);
    }

    $onDestroy() {
        this.$rootScope.$$listeners.UPDATE_FILTERS = [];
        this.$rootScope.$$listeners.CHECK_IF_MESSAGE_SHOULD_BE_VISIBLE = [];
        $(this.$window).off('resize', this.stateScreen);
        this.unregisterThumbnailInfoWatcher();
    }

    initializePaging() {
        this.Filters.SetPaging(
            {
                page: +this._startPage,
                pageSize: this.pageSize
            }
        );
    }
    /**
     * Sorting
     * @param: by {String} - string which be by sorting property
     * @param: method {String} - is a part of local method which will be called to get valid endpoint
     * I.e: method: 'accounts'
     *      Need to be 'GetAcounts'
     */
    SortBy(by) {
        /**
         * Set new sorting
         * It will set new sorting property and direction
         */
        this.Filters.SetSorting(
            {
                by: by
            }
        );

        // Get newest version of filters
        let _filters = this.Filters.BuildFiltersToSend();
        this.GetContent(_filters);
    }

    PageChangedListView(page) {
        /**
         * Set new paging
         * It will set new page
         * Page size will be not changed, but passing whole object to service
         */
        this.Filters.SetPaging(
            {
                page: page,
                pageSize: this.pageSize
            }
        );

        // Get newest version of filters
        let _filters = this.Filters.BuildFiltersToSend();
        this.GetContent(_filters);
    }

    /**
     * Show valid class based on current filter sorting
     * @param by
     * @returns {*}
     * @constructor
     */
    GetSortDirection(by) {
        this.showResearchBitesView = false;
        this.showListView = true;
        return this.Filters.GetSortDirection(by);
    }

    /**
     * Reset variables needed to control infinite scrolling
     * This should be called always when filters are updated or page is changed to first page
     */
    ResetInfiniteScroll() {
        this.Filters.SetPaging(
            {
                page: +this._startPage,
                pageSize: this.pageSize
            }
        );

        // last result set to -1 means: API has not been called yet
        this._lastResultsCount = -1;
    }

    GetPageFromFilters() {
        var _page = this.Filters.Get().paging;
        if (angular.isObject(_page) && _page.page) {
            _page = +_page.page;
        } else {
            _page = +this._startPage;
        }
        return _page;
    }

    /**
     * Get Content data
     * Bind results into $scope.contents
     */
    GetContent(filters, extend) {
        var _filters;
        this.loading = true;

        // if filters contains either a contentTypeId or a markets id greater than 999 we go to the grid layout
        if (filters.hasOwnProperty('content') || this.showListView) {
            this.showResearchBitesView = false;
        } else {
            this.showResearchBitesView = true;
        }

        /**
         * structure of filters for this endpoint is not typical
         * see VERSION4-2587 for details
         */
        if(this.showResearchBitesView) {
            _filters = {
                order: angular.isObject(filters.order) ? _.clone(filters.order) : {
                    by: 'publishDate',
                    direction: 'DESC'
                },
                page: this.GetPageFromFilters(),
                researchBiteTextSmallCount: 4,
                researchBiteTextMediumCount: 4,
                researchBiteTextLargeCount:4,
                nonReasearchBiteContentCount: 20
            };
        } else {
            _filters = {
                order: angular.isObject(filters.order) ? _.clone(filters.order) : {
                    by: 'publishDate',
                    direction: 'DESC'
                },
                paging: {
                    page: this.GetPageFromFilters(),
                    pageSize: this.pageSize
                }
            };
        }

        if (angular.isObject(filters.market) &&
            angular.isArray(filters.market.ids) &&
            filters.market.ids.length
        ) {
            _filters.marketIds = _.clone(filters.market.ids);
        }

        if (filters.content) {
            // for some reason, the content property is now missing, perhaps from the phrase(?), from the result of this statement, so we'll supply it for now.. ***
            var filtersContent = _.clone(filters.content);

            if (filtersContent.phrase) {
                this.contentPhraseModel = String(filtersContent.phrase);
                _filters.phrase = String(filtersContent.phrase);
            } else {
                this.contentPhraseModel = '';
            }

            _filters = _.extend(_filters, filtersContent);
        } else {
            this.contentPhraseModel = '';
        }

        if(this.showResearchBitesView) {
            this.doResearchBites(_filters);
        } else {
            this.doFilteredContent(_filters, extend);
        }
    }

    // Get the research bites data and sort into layout ready object arrays
    doResearchBites(filters) {
        // get just the research bite content types
        this.Content.getResearchBites(filters).then(
            (response) => {
                if (angular.isObject(response.data)) {
                    if(response.data.resultsCount === 48) {
                        this.researchBitesArray = this.Content.buildResearchBitesArray(response.data.summaries);
                        this.researchBitesArray.resultsCount = response.data.resultsCount;
                        this.researchBitesArray.totalResultsCount = response.data.totalResultsCount;
                    } else {
                        this.showResearchBitesView = false;
                    }

                    this.loading = false;
                    this._lastResultsCount = angular.isNumber(response.data.resultsCount) ? +response.data.resultsCount : 0;

                    // Content page getting total results count from Content endpoint
                    this.Filters.SetTotalResults(response.data.totalResultsCount);
                    this.contents = this.Content.flattenResearchBitesArray(response.data);

                    if(response.config.data.order){
                        this._setListContent(response.config.data.order);
                     }

                    if (this.$stateParams.id > 0) {
                        var _content = _.find(this.researchBitesArray, (_c) => {
                            return +_c.contentId === +this.$stateParams.id;
                        });

                        if (_content) {
                            this.openBundleInfo(_content);
                        } else {
                            this._tryToLoadBundleInfoByContentId(this.$stateParams.id);
                        }
                    }

                }
            },
            (error) => {
                this.$log.error(error);
            }
        );
    }

    doFilteredContent(_filters, extend){
        this.Content.Get(_filters).then(
            (content) => {
                // If load more function called
                // Add results to existing array instead of recreate it
                if (extend) {
                    this.contents.summaries = this.contents.summaries.concat(content.data.summaries);
                } else {
                    // since the component re-write, this needs to change, but I don't see why... ***
                    this.contents = content.data;
                    this.showResearchBitesView = false;
                }

                this.loading = false;

                this._lastResultsCount = content.data.resultsCount ? +content.data.resultsCount : 0;

                // Content page getting total results count from Content endpoint
                this.Filters.SetTotalResults(content.data.totalResultsCount);

                this._setListContent(content.config.data.order);

                if (this.$stateParams.id > 0) {
                    var _content = _.find(content.data.summaries, (_c) => {
                        return +_c.contentId === +this.$stateParams.id;
                    });

                    if (_content) {
                        this.openBundleInfo(_content);
                    } else {
                        this._tryToLoadBundleInfoByContentId(this.$stateParams.id);
                    }
                }

                // Check if additional message should be visible
                this.$rootScope.$emit('CHECK_IF_MESSAGE_SHOULD_BE_VISIBLE');
            }, function(error) {
                this.$log.error('Lookup \'content\' error.');
                this.$log.error(error);
                this.loading = false;
            }
        );
    }

    getRbImage(contentText) {
        if(contentText) {
            if (contentText.split(" ").length > 20) {
                return '/assets/images/textbite_icon_grey.png';
            } else if (contentText.split(" ").length > 15 && contentText.split(" ").length <= 20) {
                return '/assets/images/textbite_icon_green.png';
            } else if (contentText.split(" ").length <= 15) {
                return '/assets/images/textbite_icon_brown.png';
            }
        }
    }

    ////////////////

    isCopyAllowed() {
        if (!this.AllowedCounts.Get()) {
            return false;
        }

        let _user = this.User.Get();

        if (!_user) {
            return false;
        }

        // for details check first comment in VERSION4-3009
        return this.AllowedCounts.IsUnlimited('CURRENT_DOWNLOADED_CONTENTS_COUNT') || _user.remainingContentToDownload > 0;
    }

    stateScreen() {
        this.AppHelper.stateScreen(this);
    }

    openBundleInfo(content) {
        this.spinner_b = true;

        var getContent = {
            'contentId': content.contentId
        };

        this.bundleBreadcrumbs = true;

        this.Rest.Get(this.pageType + '/details', getContent)
            .then((response) => {
                this.contentGet = response.data;
                this.contentGet.alreadyDownloaded = content.alreadyDownloaded;
                this.showAboutBundle = true;
                this.spinner_b = false;

            });

        document.body.scrollTop = 0;
        this._popoverForIndexOpened = false;

        // below is a workaround to not having $location working - need to add content id to url VERSION4-3233
        var currentUrl = window.location.href;
        var urlArray = currentUrl.match(/\/content\/(\d+)/);
        // if there's already a content ID at the end we don't add it again
        if (history.replaceState && urlArray === null ) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '/' + content.contentId;
            window.history.replaceState({path:newurl},'',newurl);
        }

    }

    setAlreadyDownloadedInCollection(contentId) {
        var _tmpLength = this.contents.summaries.length;

        for (var i = 0; i < _tmpLength; i++) {
            var _tmpItem = this.contents.summaries[i];
            if (+_tmpItem.contentId === +contentId) {
                this.contents.summaries[i].alreadyDownloaded = true;
                break;
            }
        }
    }

    detailViewDownload(action, content) {
        var user = this.User.Get();
        if (!content.alreadyDownloaded && user && user.remainingContentToDownload) {
            var trackingData = { 'page': 'content', 'route': 'detail-view', 'action': action.type, 'file-name': content.title};
            this.trackDownload(trackingData);
        }
    }

    _tryToLoadBundleInfoByContentId(contentId) {
        this.loading = true;

        this.Content.Get({
            phrase: contentId
        }).then(
            (response) => {
                this.loading = false;

                if (angular.isArray(response.data.summaries) && response.data.summaries.length) {
                    this.openBundleInfo(response.data.summaries[0]);
                }
            },
            () => {
                this.loading = false;
            }
        );
    }

    /**
     * set the data/contents for table/list IF table/list is displayed
     * @private
     */
    _setListContent(sort) {
        if (!this.isGrid) {
            if (this.showResearchBitesView && this.researchBitesArray.resultsCount >= this.pageSize) {
                this.listContent = this.Content.normalizeResearchBitesArray(this.researchBitesArray, sort);
            } else {
                this.listContent = this.contents;
            }
        }
    }

    PageChanged(extend) {
        var nextPage = this.GetPageFromFilters();

        if (extend) {
            nextPage++;
        }

        this.Filters.SetPaging(

            {
                page: nextPage,
                pageSize: this.pageSize
            }
        );

        // Get newest version of filters
        var _filters = this.Filters.BuildFiltersToSend();

        this.GetContent(_filters, extend);
    }

    SortingChanged(sorting) {
        switch (sorting.value) {
            case 'az':
                this.Filters.SetSorting(
                    {
                        by: 'Title',
                        direction: 'ASC'
                    }
                );
                break;
            case 'za':
                this.Filters.SetSorting(
                    {
                        by: 'Title',
                        direction: 'DESC'
                    }
                );
                break;
            case 'no':
                this.Filters.SetSorting(
                    {
                        by: 'PublishDate',
                        direction: 'DESC'
                    }
                );
                break;
            case 'on':
                this.Filters.SetSorting(
                    {
                        by: 'PublishDate',
                        direction: 'ASC'
                    }
                );
                break;
        }

        var _filters = this.Filters.BuildFiltersToSend();
        this.ResetInfiniteScroll();
        this.GetContent(_filters);
    }


    copyDone(content) {
        if (this.isCopyAllowed()) {
            // content downloads are unlimited OR limit is not exceeded yet - so let's proceed with copy...
            this.Content.SaveRegisterContentDownload(content.contentId);

            // set already downloaded on clicked element
            content.alreadyDownloaded = true;

            // set already downloaded on clicked element in collection
            this.setAlreadyDownloadedInCollection(content.contentId);
        }

        this.AppHelper.showProcessInfoDialog(
            ($scope) => {
                $scope.message = this.isCopyAllowed() ?
                    'Your text has been copied.' :
                    'Limit Exceeded!';
                $scope.messageType = 'success';

                // set button1 text (by default button1 callback closes dialog)
                $scope.button1Text = 'Done';
            },
            true // allow closing with escape or background click
        );
    }

    announceClick(menuItem, contentItem, doDownload) {
        switch (contentItem.mediaType) {
            case 'VID':
                this.FileOperations.buildDirectLink([], '', contentItem, this.DOWNLOAD_UNLOCKED_TYPE, doDownload).then(
                    () => {
                        // set already downloaded on clicked element in collection
                        if (doDownload) {
                            contentItem.alreadyDownloaded = true;
                            this.setAlreadyDownloadedInCollection(contentItem.contentId);
                        }
                    },
                    response => {
                        this.AppHelper.openDialog({
                            component: 'download-file-expired-modal',
                            resolve: {
                                params: () => ({
                                    type: 'VID',
                                    item: contentItem,
                                    message: ((response || {}).data || {}).errorMessage ? response.data.errorMessage : '',
                                    status: response.status
                                })
                            }
                        });
                    }
                );
                break;

            case 'PDF':
                this.FileOperations.buildDirectDocumentLink([], '', contentItem, menuItem.type, doDownload).then(
                    () => {
                        // set already downloaded on clicked element in collection
                        if (doDownload) {
                            contentItem.alreadyDownloaded = true;
                            this.setAlreadyDownloadedInCollection(contentItem.contentId);
                        }
                    },
                    response => {
                        this.AppHelper.openDialog({
                            component: 'download-file-expired-modal',
                            resolve: {
                                params: () => ({
                                    type: 'PDF',
                                    item: contentItem,
                                    message: ((response || {}).data || {}).errorMessage ? response.data.errorMessage : '',
                                    status: response.status
                                })
                            }
                        });
                    }
                );
                break;

            default:
                this.FileOperations.buildDirectDocumentLink([], '', contentItem, this.DOWNLOAD_UNLOCKED_TYPE, doDownload).then(
                    () => {
                        // set already downloaded on clicked element in collection
                        if (doDownload) {
                            contentItem.alreadyDownloaded = true;
                            this.setAlreadyDownloadedInCollection(contentItem.contentId);
                        }
                    },
                    response => {
                        this.AppHelper.openDialog({
                            component: 'download-file-expired-modal',
                            resolve: {
                                params: () => ({
                                    type: 'other',
                                    item: contentItem,
                                    message: ((response || {}).data || {}).errorMessage ? response.data.errorMessage : ''
                                })
                            }
                        });
                    }
                );
        }
    }

    // mixpanel download tracking
    trackDownload(data) {
        this.Mixpanel.trackDownload(data);
    }

    gridViewDownload(action, content) {
        var user = this.User.Get();
        if(!content.alreadyDownloaded && user && user.remainingContentToDownload) {
            var trackingData = { 'page': 'content', 'route': 'grid-view-popover', 'action': action.type, 'file-name': content.title};
            this.trackDownload(trackingData);
        }
    }

    listViewDownload(action, content) {
        var user = this.User.Get();
        if(!content.alreadyDownloaded && user && user.remainingContentToDownload) {
            var trackingData = { 'page': 'content', 'route': 'list-view', 'action': action, 'file-name': content.title};
            this.trackDownload(trackingData);
        }
    }

    listTitleDownload(action, content) {
        var user = this.User.Get();
        if(!content.alreadyDownloaded && user && user.remainingContentToDownload) {
            var trackingData = { 'page': 'content', 'route': 'list-view-popover', 'action': action, 'file-name': content.title};
            this.trackDownload(trackingData);
        }
    }

    loadMore() {

        // TODO
        // Just walk around for ng-infinite-scroll
        // For edge cases its not working like expected
        // Loading new element every time when scrolling
        // There is some problems with calculation
        // In the future replace ng-infinite-scroll with own functionality
        var _bodyHeight = $('body').height();
        var _offset = document.body.scrollTop;
        var _windowHeight = window.innerHeight;
        var _scrollWithWalkaround = _offset + _windowHeight >= _bodyHeight;
        if (!_scrollWithWalkaround || this.loading || this._lastResultsCount > -1 && this._lastResultsCount < this.pageSize) {
            return;
        }

        this.PageChanged(true);
    }

    searchPanelChangeState() {
        this.showSearchPanel = !this.showSearchPanel;
    }

    searchHorizontalChangeState() {
        this.showHorizontalSearch = !this.showHorizontalSearch;
    }

    openCustomContentDialog() {
        this.customContentDialog = true;
    }

    closeCustomContentDialog() {
        this.customContentDialog = false;
    }

    prevBundle() {
        if (this.breadcrumbs <= 0) {
            this.showAboutBundle = false;
        } else {
            this.bundleShow(this.breadcrumbs.pop());
        }
    }

    singleValueUpdate(key) {
        if (key.which === 13) {
            this.Filters.SetFilterValue('content', 'phrase', this.contentPhraseModel);
            this.Filters.Update();
        }
    }

    bundleShow(id) {
        this.spinner_b = true;
        var getContent = {
            'contentId': id
        };
        this.Rest.Get(this.pageType + '/details', getContent)
            .then((response) => {
                this.contentGet = response.data;
                this.showAboutBundle = true;
                this.spinner_b = false;
            });
        this.breadcrumbs.slice(0, -1);
        this.bundleBreadcrumbs = true;

    }

    startFileSearchByEnter($event) {
        if($event.keyCode === 13) {
            this.startFileSearch();
        }
    }

    showVideoPopup(contentGet) {
        if ((contentGet.contentType === 'Video Teaser' ||
                contentGet.contentType === 'Video Brief' )
            && contentGet.videoEmbeddedCode
            && this.UserRole.check(this.UserRole.OP_VIEW_CONTENT_VIDEO)) {
            this.AppHelper.openDialog({
                template: contentGet.videoEmbeddedCode,
                parent: $(document.body),
                clickOutsideToClose: true,
                fullscreen: false,
            });
        }
    }

    backtocontent() {
        this.showAboutBundle = false;
        this.bundleBreadcrumbs = false;
        this.contentGet = [];
        this.$state.go('app.content');
    }

    isVideoType(contentGet) {
        if (contentGet) {
            return [
                this.CONTENT_TYPE_VIDEO_BRIEF,
                this.CONTENT_TYPE_VIDEO_TEASER
            ].indexOf(contentGet.contentTypeId) != -1;
        }
        return false;
    }

    isSocialTilesType(contentGet) {
        if (contentGet) {
            return [
                this.CONTENT_TYPE_SOCIAL_TILES
            ].indexOf(contentGet.contentTypeId) != -1;
        }
        return false;
    }

    /**
     * toggle between grid and list table views
     * and pagination
     */
    toggleView(pageSize) {
        this.isGrid = !this.isGrid;
        // if we are returning to the research bites view, reset the view flags and go to page 1
        if(this.showListView) {
            this.showResearchBitesView = true;
            this.showListView = false;
            this.PageChangedListView(1);
        } 
        else {
            this._setListContent();
        }
        this.pageSize = pageSize;
    }

    OpenPopover(element, index, opened) {
        this._popoverForIndexOpened = { index: index, opened: opened };
    }

    IsPopoverOpened(element, index) {
        return index === this._popoverForIndexOpened.index && this._popoverForIndexOpened.opened === true;
    }
}
Content.$inject = ['Mixpanel', '$scope', '$rootScope', 'User', 'FileOperations', '$stateParams', '$state', '$window', 'Filters', '$log', 'Content', 'AppHelper', 'AllowedCounts', 'UserRole', 'Rest'];

export default Content;
