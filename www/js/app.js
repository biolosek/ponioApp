// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('ponio', ['ionic', 'ponio.controllers', 'ponio.services'])

.run(function($ionicPlatform, $rootScope, $window, $http) {

  $rootScope.checkAuth = function(){
    $http({
      method: 'post',
      url: 'http://supremedev.usermd.net/ponioApp/php/checkAuth.php',
      data: {
        unique_id: parseInt(window.localStorage['uniqueId']),
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data){
      if(angular.isArray(data.data) && data.data.length == 1 && data.data[0]['active'] == 1){
        $rootScope.unique_id = data.data[0]['unique_id'];
        $rootScope.active = data.data[0]['active'];
        $rootScope.role = data.data[0]['role'];
        $rootScope.authenticated = true;
        if (window.localStorage['negative'] == 'false'){
          $rootScope.negative = false;
        }
        if (window.localStorage['negative'] == 'true'){
          $rootScope.negative = true;
        }
        if (window.localStorage['count'] == 'false'){
          $rootScope.count = false;
        }
        if (window.localStorage['count'] == 'true'){
          $rootScope.count = true;
        }
        if (window.localStorage['myNumber'] == 'false'){
          $rootScope.myNumber = false;
        }
        if (window.localStorage['myNumber'] == 'true'){
          $rootScope.myNumber = true;
        }
        window.location.href = '#/tab/chats';
        $rootScope.connectWebSocket();
        return;
      } else {
        $rootScope.unique_id = null;
        $rootScope.active = 0;
        $rootScope.role = 0;
        $rootScope.authenticated = false;
        if (window.localStorage['negative'] == 'false'){
          $rootScope.negative = false;
        }
        if (window.localStorage['negative'] == 'true'){
          $rootScope.negative = true;
        }
        if (window.localStorage['count'] == 'false'){
          $rootScope.count = false;
        }
        if (window.localStorage['count'] == 'true'){
          $rootScope.count = true;
        }
        if (window.localStorage['myNumber'] == 'false'){
          $rootScope.myNumber = false;
        }
        if (window.localStorage['myNumber'] == 'true'){
          $rootScope.myNumber = true;
        }
        window.location.href = '#/tab/dash';
      }
    })
  }

  $rootScope.connectWebSocket = function () {
       $rootScope.webSocket = new WebSocket("ws://ws.supremedev.usermd.net:9007?" + window.localStorage['uniqueId']);

       $rootScope.webSocket.onopen = function (event) {
           console.log('Nawiązano połączenie z WebSocketem.');
       }

       $rootScope.webSocket.onerror = function (event) {
           console.log('Błąd połączenia z WebSocketem : ', event);
       }

       $rootScope.webSocket.onclose = function (event) {
           console.log('Zamknięto połączenie z WebSocketem.');
       }

       $rootScope.webSocket.onmessage = function (event) {
          var messageArray = event.data.split("|");
          console.log(messageArray);
       }

   }

   $rootScope.logout = function() {
     window.location.href = '#/tab/dash';
     window.localStorage.removeItem('uniqueId');
     window.localStorage.removeItem('active');
     window.localStorage.removeItem('authenticated');
     window.localStorage.removeItem('role');
     $rootScope.unique_id = null;
     $rootScope.active = 0;
     $rootScope.authenticated = false;
     $rootScope.role = 0;
     window.localStorage['authenticated'] = false;
     window.localStorage['uniqueId'] = $rootScope.unique_id;
     window.localStorage['active'] = $rootScope.active;
     window.localStorage['role'] = $rootScope.role;
     if($rootScope.webSocket != undefined){
       $rootScope.webSocket.close();
     }
     window.location.reload();
   }

  $rootScope.checkAuth();

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(false);

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
