var app = angular.module('app', ['ngRoute'])
    .config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
            angular.forEach(<@&routes@>, function(route) {
                var url = route.url;
                delete route.url;
                $routeProvider.when(url, route);
            });
            $locationProvider.html5Mode(true);
        }
    ])
    // Whitelist resource sharing
    .config(['$sceDelegateProvider',function($sceDelegateProvider){
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'http://*.youtube.com/**',
            'https://*.youtube.com/**'
        ]);
    }])
    .run(['$location', '$rootScope', '$http',
        function($location, $rootScope, $http) {
            // $rootScope.bgClass = 'bg-home';
            $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
                if (current) {
                    document.title = current.$$route.title;
                    $rootScope.bgClass = current.$$route.bgClass;
                }
            });
        }
    ]);