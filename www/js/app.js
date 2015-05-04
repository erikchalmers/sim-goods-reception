// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
(function(){angular.module('app', ['ionic', 'ngMockE2E','app.translate', 'app.controllers', 'app.services'])

// HTTPBACKEND: This is for testning http calls only!
.run(function($rootScope, $ionicPlatform, $httpBackend, $http) {
    var token = "NjMwNjM4OTQtMjE0Mi00ZWYzLWEzMDQtYWYyMjkyMzNiOGIy";
    
     $httpBackend.whenGET('https://login').respond([{id:1, name: "hej"}]);
            
    
    //Dummy backend, always return 401
    $httpBackend.whenGET('https://test').respond(function(method, url, data, headers){
        if(headers.Authorization == 'test'){
            return [200, {test: 'success'}];
        }
        else{
            return [401];
        }
        
    });
    
    //Dummy backend, for login
    $httpBackend.whenPOST('https://login').respond(function(method, url, data) {
        var data = angular.fromJson(data);
        
        if(data.username == 'a' && data.password =='a'){
            return  [200 , { authorizationToken: token } ];
        }
        else{ 
            return [400];
        } 
    });
    

    $httpBackend.whenGET('https://logout').respond(function(method, url, data) {
    return [200];
    });


    $httpBackend.whenGET(/.*/).passThrough();
    
})

.run(function($rootScope, $ionicPlatform, $ionicHistory, $state, $location, $translate) {
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
    
    //Get preferred Language and sets it to current language
    document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    navigator.globalization.getPreferredLanguage(
    function (language) {
        if(language.value == 'sv-SE' || language.value == 'en-US')
        $translate.use(language.value)
        alert('language: ' + language.value + '\n');
    },
    function () {
        console.log ('Error getting language, using default..\n');
    }
    );
}
    
    // For Android and Windows phone backbutton!
    $ionicPlatform.registerBackButtonAction(function () {
        if ($state.is('menu.home') || $state.is('signin') || $state.is('menu.history') || $state.is('menu.help') || $state.is('menu.about')) {
            navigator.app.exitApp();
        } 
        else {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true,
                historyRoot: true
                });
 
            
            $state.go('menu.home');
        }
    }, 101);
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('menu', {
    url: '/menu',
    abstract: true,
    templateUrl: 'partials/menu.html',
    controller: 'AppCtrl'
  })
  
  .state('menu.home', {
    url: '/home/',
    views :{
        'menuContent': {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        }
    }
  })
  
  .state('menu.history', {
      url: '/history/',
      views: {
          'menuContent':{
              templateUrl: 'partials/history.html',
              controller: 'HistoryCtrl'
          }
      }
  })
  .state('menu.about', {
      url: '/about/',
      views: {
          'menuContent': {
              templateUrl: 'partials/about.html',
              controller: 'AboutCtrl'
          }
      }
  })
  .state('menu.pallets', {
      url: '/home/:dispatchId?palletId',
      views: {
          'menuContent': {
              templateUrl: 'partials/pallets.html',
              controller: 'PalletsCtrl',
          }
      }
      
  })
  .state('menu.pallet', {
      url: '/home/:dispatchId/:palletId',
      views: {
          'menuContent': {
              templateUrl: 'partials/pallet.html',
              controller: 'PalletCtrl'
          }
      } 
  })
  .state('signin', {
      cache: false,
      url: '/signin/',
      templateUrl: 'partials/signin.html',
      controller: 'SigninCtrl'
  })
  
  $urlRouterProvider.otherwise('/signin/');
});
           }());