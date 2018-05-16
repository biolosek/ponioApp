// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('ponio', ['ionic', 'ponio.controllers', 'ponio.services'])

.run(function($ionicPlatform, $rootScope, $window) {

  $rootScope.unique_id = null;
  $rootScope.active = 0;
  $rootScope.role = 0;
  $rootScope.authenticated = false;

  $rootScope.unique_id = window.localStorage['uniqueId'];

  if (window.localStorage['authenticated'] == 'true'){
    $rootScope.authenticated = true;
  }
  if (window.localStorage['authenticated'] == 'false'){
    $rootScope.authenticated = false;
  }
  if (window.localStorage['active'] == '1'){
    $rootScope.active = 1;
  }
  if (window.localStorage['active'] == '0'){
    $rootScope.active = 0;
  }
  if (window.localStorage['role'] == '0'){
    $rootScope.role = 0;
  }
  if (window.localStorage['role'] == '1'){
    $rootScope.role = 1;
  }

  if ($rootScope.authenticated == true && $rootScope.active == 1) {
    window.location.href = '#/tab/chats';
  }
  if ($rootScope.authenticated == false && $rootScope.active == 0) {
    window.location.href = '#/tab/dash';
  }


  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $locationProvider) {

  $locationProvider.html5Mode(false);
  $locationProvider.hashPrefix('');

  $ionicConfigProvider.tabs.position('bottom'); // other values: top

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: false,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })
    .state('tab.request', {
      url: '/requests',
      views: {
        'tab-requests': {
          templateUrl: 'templates/tab-requests.html',
          controller: 'RequestsCtrl'
        }
      }
    })
  .state('tab.setting', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-settings.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
