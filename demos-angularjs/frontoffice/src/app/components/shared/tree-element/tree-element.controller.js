export default class TreeElementController {

    /**
     * Toggle function
     * Need to be passed from initial view / controller
     * @param category
     * @constructor
     */
    ToggleCategory(category) {
        this.expand()(category);
    }

    /**
     * Select / Deselect checkbox
     * Need to be passed from initial view / controller
     * @param category
     * @constructor
     */
    ToggleCheckbox(category) {
        this.toggle()(category);
    }
}