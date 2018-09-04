const HttpProvider = ($q, $injector, Session, $timeout, $window, $state) => {
    return {
        'responseError': error => {

            const errorConfig = error.config || {};

            /**
             * try to catch the 404
             * exclude:
             * - DELETE calls
             * - SavedSearches calls (to prevent from display 404 page if query not found - VERSION4-4117)
             */
            if (errorConfig.method !== 'DELETE' && !/SavedSearches/i.test(errorConfig.url) && error.status === 404) {
                $state.go('app.error404', { error: error });
                return $q.reject(error);
            }

            // handle 404 here also - in case it was not caught above
            if ([400, 404, 405, 500].indexOf(error.status) !== -1) {
                return $q.reject(error);
            }

            if (error.status === 401) {
                $injector.get('Authorization').Logout();
                return $q.reject(error);
            }

            if(error.status === 403) {
                const deferred = $q.defer();
                $injector.get('Rest').renegotiateOauth2Token('LE_FrontOffice')
                    .then((response) => {
                        // Add client_id before set session
                        response.data.client_id = 'LE_FrontOffice';
                        $injector.get('Authorization').SetSession(response.data);

                        $injector.get('$http')({
                            url: error.config.url,
                            params: error.config.params,
                            method: error.config.method,
                            data: error.config.data,
                            headers: {
                                'authorization': 'Bearer ' + $injector.get('Authorization').GetAccessToken()
                            }
                        })
                        .then((response) => {
                            deferred.resolve(response);
                        });
                    });
                return deferred.promise;
            }

        },

        'response': (response) => {

            if(Session.getResponsesFinishedStatus()) {
                $timeout.cancel(Session.getResponsesFinishedStatus())
            }


            // Not refresh token after login action
            // No refresh token after getting HTML files (should be cached files soon)
            if(response.config.url.indexOf('Login') === -1 &&
                response.config.url.indexOf('token') === -1 &&
                response.config.url.indexOf('VERSION') === -1 &&
                angular.isObject(response.data)) {

                const _timeout = $timeout(() => {

                    $injector.get('$http').get($window.location.origin + '/assets/VERSION.html').then(
                        function(response) {

                            const _currentVersion = response.data;
                            const _previousVersion = $injector.get('Build').getBuildVersion();

                            if(!_previousVersion) {
                                $injector.get('Build').setBuildVersion(_currentVersion);
                            }

                            if(_previousVersion && _currentVersion !== _previousVersion) {
                                $injector.get('Build').setVersionMismatch();
                                $injector.get('AuthenticationService').Logout();
                            }

                        }
                    );

                    if (JSON.parse($injector.get('Cookie').Get('session')).client_id === 'LE_FrontOffice') {
                        $injector.get('Rest').oauth2Token(
                            {
                                grant_type: 'refresh_token',
                                client_id: 'LE_FrontOffice',
                                refresh_token: $injector.get('Authorization').GetRefreshToken()
                            }
                        ).then(
                            function(response) {
                                if (response.status === 200) {
                                    // Add client_id before set session
                                    response.data.client_id = 'LE_FrontOffice';
                                    $injector.get('Authorization').SetSession(response.data);
                                    Session.setSessionTime(response.data.expires_in);
                                    Session.setAllResponsesFinished(null);

                                    // Reset modal status
                                    Session.disableDialog(null);
                                }
                            })
                            .catch(
                                err => $injector.get('AppHelper').logError('http interceptor', err)
                            );
                    } else {
                        $injector.get('Rest').renegotiateOauth2Token('LE_FrontOffice')
                            .then(function(response) {
                                // Add client_id before set session
                                response.data.client_id = 'LE_FrontOffice';
                                $injector.get('Authorization').SetSession(response.data);
                                Session.setSessionTime(response.data.expires_in);
                                Session.setAllResponsesFinished(null);

                                // Reset modal status
                                Session.disableDialog(null);
                            })
                            .catch(
                                err => $injector.get('AppHelper').logError('http interceptor', err)
                            );
                    }
                }, 5000);

                Session.setAllResponsesFinished(_timeout);
            }

            return $q.resolve(response);
        }
    };
};
HttpProvider.$inject = ['$q', '$injector', 'Session', '$timeout', '$window', '$state'];

export default HttpProvider;