angular.module('SethTippetts', ['ui.router', 'ui.bootstrap'])
  .config(['$urlRouterProvider', '$locationProvider', function ($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
  }])
  .run(['$rootScope', function ($rootScope) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error){
      console.log(arguments);
    })
  }]);
