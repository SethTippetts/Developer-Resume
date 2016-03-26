angular.module('SethTippetts')
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    console.log('state provider run');
    // Now set up the states
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/app/templates/home.html',
        controllerAs: 'home',
        controller: 'HomeCtrl',
      });

  }])
  .controller('HomeCtrl', ['$state', function($state){
    var self = this;

    self.is = function(name){
      return $state.is(name);
    };
  }]);
