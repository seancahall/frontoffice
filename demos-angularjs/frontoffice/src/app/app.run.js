/** @ngInject */
const appRun = ($rootScope, $location, Cookie, $templateCache) => {

    let popOverTemplate = require("./components/content/content-popover.template.html");
    $templateCache.put("popOverTemplate", popOverTemplate);

    let viewAvailable = false;

    // That urls not required to be logged
    let excludePathes = [
        'login',
        'reset',
        'createPassword',
        'auth-by-link',
        'intelligence'
    ];

    // Check urls
    excludePathes.forEach(url => {
        if($location.path().indexOf(url) > -1) {
            viewAvailable = true;
        }
    });

    $rootScope.$on('$locationChangeStart', () => {
        if (!Cookie.Get('session') && !viewAvailable) {
            // VERSION4-3234 check if the user simply pasted in a content URL without logging in
            const currentUrl = window.location.href;
            if(currentUrl) {
                const urlArray = currentUrl.match(/\/content\/(\d+)/);
                if(urlArray !== null && !isNaN(parseInt(urlArray[1]))) {
                    $location.path('/login').search({contentId: urlArray[1]});
                    // VERSION4-4071 parse for other paths so we can redirect after login
                } else if(currentUrl.match( /markets|accounts|contacts|company|siteProfile|contactProfile|technology-installs|content|files|users/i )) {
                    const location = document.createElement("a");
                    location.href = currentUrl;
                    $location.path('/login').search({linkAddress: location.pathname});
                }
            }
            $location.path('/login');
        } else if (Cookie.Get('session') && $location.path() === '/login') {
            $location.path('/');
        }
    });
};
appRun.$inject = ['$rootScope', '$location', 'Cookie', '$templateCache'];

export default appRun;
