class BubblesController {
    constructor($rootScope, Bubbles, SelectSearchResults, ResultSelection, $injector) {
        this.$rootScope = $rootScope;
        this.Bubbles = Bubbles;
        this.SelectSearchResults = SelectSearchResults;
        this.ResultSelection = ResultSelection;
        this.$injector = $injector;
    }

    $onInit() {
        // Default user will see two rows of tags
        // Every click will increase row size by additional two
        this._tagsHeight = 62;

        /**
         * Listener
         * When filters will change update bubbles
         */
        this.unsubscribeUpdateBubbles = this.$rootScope.$on('UPDATE_BUBBLES', () => {
            this.BuildBubbles();
        });

        /**
         * Listener
         * When result selection will be changed
         */
        this.unsubscribeUpdateResultSelectionBubbles = this.$rootScope.$on('UPDATE_RESULT_SELECTION_BUBBLES', () => {
            this.BuildResultSelectionBubbles();
        });

        /**
         * Notify listeners: bubbles can be updated by controllers/services
         */
        this.$rootScope.$emit('BUBBLES_INITIATED');

        /**
         * Hide bubbles if message available
         */
        this.unsubscribeHideBubbles = this.$rootScope.$on('HIDE_BUBBLES', (event, hidden) => {
            this.hidden = hidden;
        });
    }

    $onDestroy() {
        if(this.unsubscribeHideBubbles) {
            this.unsubscribeUpdateResultSelectionBubbles();
            this.unsubscribeUpdateBubbles();
            this.unsubscribeHideBubbles();
        }
    }

    BuildBubbles() {
        this.Bubbles.BuildBubbles();
    }

    BuildResultSelectionBubbles() {
        this.Bubbles.BuildResultSelectionBubbles();
    }

    GetBubbles() {
        return this.Bubbles.Get();
    }

    GetResultSelectionBubbles() {
        return this.Bubbles.GetResultSelectionBubbles();
    }

    ClearOne(bubble) {
        this.Bubbles.ClearOne(bubble);
        this.SelectSearchResults.resetModal();
    }

    ClearOneResultSelection(bubble) {
        this.ResultSelection.ClearOneCategory(bubble.key);
        this.Bubbles.BuildResultSelectionBubbles();
        this.$injector.get('Filters').Update();
    }

    ClearAll() {
        this.Bubbles.ClearAll();
        this.SelectSearchResults.resetModal();
    }

    GetTagsHeight() {
        return this._tagsHeight + 'px';
    }

    GetTwoMoreRowsOfTags() {
        this._tagsHeight += 62;
    }

    ShowButtonToGetMoreRows() {
        return this.GetBubbles().length && $('.bubbles-wrapper ul').height() > this._tagsHeight;
    }
}
BubblesController.$inject = ['$rootScope', 'Bubbles', 'SelectSearchResults', 'ResultSelection', '$injector'];

export default BubblesController;
