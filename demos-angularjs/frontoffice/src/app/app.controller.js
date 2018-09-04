class AppController {
    constructor($state) {
        this.$state = $state;
        this.hideHeader = this.IsHeaderVisible();
    }

    $doCheck() {
        this.hideHeader = this.IsHeaderVisible();
    }

    IsHeaderVisible() {
        return this.$state.params.hideHeader;
    }
}
AppController.$inject = ['$state'];

export default AppController;
