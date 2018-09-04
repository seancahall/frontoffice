export default class FooterController {
    // Get version
    GetVersion() {
        return VERSION;
    }

    // Get current year
    GetYear() {
        return new Date().getFullYear();
    }
}
