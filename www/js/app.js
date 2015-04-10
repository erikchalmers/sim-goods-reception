// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'partials/menu.html',
    controller: 'AppCtrl'
  })
  
  .state('app.orders', {
    url: '/orders',
    views :{
        'menuContent': {
            templateUrl: 'partials/orders.html',
            controller: 'OrdersCtrl'
        }
    }
  })
  
  .state('app.history', {
      url: '/history',
      views: {
          'menuContent':{
              templateUrl: 'partials/history.html',
              controller: 'HistoryCtrl'
          }
      }
  })
  .state('app.about', {
      url: '/about',
      views: {
          'menuContent': {
              templateUrl: 'partials/about.html',
              controller: 'AboutCtrl'
          }
      }
  });
  
  $urlRouterProvider.otherwise('/app/orders');
});
