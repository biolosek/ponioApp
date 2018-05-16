angular.module('ponio.controllers', [])

.controller('DashCtrl', function($scope, $ionicPopup, $http, $rootScope, $window) {
  $scope.showLoginPopup = function() {
    $scope.loginData = {};

    // An elaborate, custom popup
    var loginPopup = $ionicPopup.show({
      template: '<input type="text" placeholder="Nazwa Użytkownika" ng-model="loginData.login"></br><input placeholder="Hasło" type="password" ng-model="loginData.password">',
      title: 'Proszę podać dane logowania',
      scope: $scope,
      buttons: [
        { text: 'Anuluj',
          type: 'button-assertive', },
        {
          text: '<b>Zaloguj</b>',
          type: 'button-balanced',
          onTap: function(e) {
            $http({
              method: 'post',
              url: 'http://supremedev.usermd.net/ponioApp/php/login.php',
              data: {
              login: $scope.loginData.login,
              password: $scope.loginData.password,
              },
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
          .then(function successCallback(data){
            $scope.myResponse = data.data;
                if ($scope.myResponse != undefined && $scope.myResponse[0].account_id != undefined && $scope.myResponse[0].account_id != 0 && $scope.myResponse[0].active == 1) {
                  $rootScope.unique_id = $scope.myResponse[0].unique_id;
                  $rootScope.active = $scope.myResponse[0].active;
                  $rootScope.role = $scope.myResponse[0].role;
                  $rootScope.authenticated = true;
                  window.localStorage['authenticated'] = $rootScope.authenticated;
                  window.localStorage['uniqueId'] = $rootScope.unique_id;
                  window.localStorage['active'] = $rootScope.active;
                  window.localStorage['role'] = $rootScope.role;
                  window.location.href = '#/tab/chats';
                  var alertPopup = $ionicPopup.alert({
                    title: 'Udało się !',
                    template: 'Zostałeś zalogowany do systemu.'
                  });
                  return;
                }
                if ($scope.myResponse[0].active == 0 ) {
                  var alertPopup = $ionicPopup.alert({
                    title: 'Błąd !',
                    template: 'Twoje konto nie zostało jeszcze zautoryzowane przez administratora.'
                  });
                  return;
                }
                if ($scope.myResponse === 'Wrong password') {
                  var alertPopup = $ionicPopup.alert({
                    title: 'Błąd !',
                    template: 'Podałeś błędne hasło, proszę spóbować ponownie.'
                  });
                  return;
                }
                if ($scope.myResponse === 'No account') {
                  var alertPopup = $ionicPopup.alert({
                    title: 'Błąd !',
                    template: 'Konto o takim loginie nie istnieje w systemie.'
                  });
                  return;
                }
                else {
                  var alertPopup = $ionicPopup.alert({
                    title: 'Błąd !',
                    template: 'Coś poszło nie tak, proszę spóbować ponownie.'
                  });
                  return;
                }
          })
            }
          }
      ]
    });
   };

   $scope.showRegisterPopup = function() {
     $scope.registerData = {};

     // An elaborate, custom popup
     var registerPopup = $ionicPopup.show({
       template: '<input type="text" placeholder="Nazwa Użytkownika" ng-model="registerData.login"></br><input type="password" placeholder="Hasło" ng-model="registerData.password"></br><input type="password" placeholder="Powtórz Hasło" ng-model="repeatpassword"></br><span ng-show="registerData.password != repeatpassword" class="redSpan"><b>Hasła nie są identyczne!</b></span>',
       title: 'Proszę podać dane do rejestracji',
       scope: $scope,
       buttons: [
         { text: 'Anuluj',
           type: 'button-assertive', },
         {
           text: '<b>Zarejestruj</b>',
           type: 'button-balanced',
           onTap: function(e) {
             $http({
               method: 'post',
               url: 'http://supremedev.usermd.net/ponioApp/php/registration.php',
               data: {
               login: $scope.registerData.login,
               password: $scope.registerData.password,
               },
               headers: {'Content-Type': 'application/x-www-form-urlencoded'}
             })
           .then(function successCallback(data){
             if (data.data == "Duplicate login entry") {
               var alertPopup = $ionicPopup.alert({
                  title: 'Błąd !',
                  template: 'Konto o tym loginie już istnieje ! Proszę wybrać inną nazwe użytkownika i spórbować ponownie.'
                });
                return;
             }
             if (data.data == "Duplicate unique_id entry") {
               var alertPopup = $ionicPopup.alert({
                 title: 'Błąd !',
                 template: 'Nastąpił bardzo rzadki błąd systemowy, spróbuj ponownie..'
               });
               return;
             }
             if (data.data == "Success") {
               var alertPopup = $ionicPopup.alert({
                 title: 'Udało się !',
                 template: 'Twoje konto zostało zarejestrowane. Poczekaj na autoryzacje administratora.'
               });
               return;
             }
             else {
               var alertPopup = $ionicPopup.alert({
                 title: 'Błąd !',
                 template: 'Coś poszło nie tak. Spróbuj ponownie !'
               });
               return;
             }
           })
           }
         }
       ]
     });
    };
})

.controller('ChatsCtrl', function($scope) {

})

.controller('ChatDetailCtrl', function($scope, $stateParams) {

})

.controller('AccountCtrl', function($scope, $rootScope, $window) {
  $scope.logout = function() {
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
    window.location.reload();
  }
})

.controller('RequestsCtrl', function($scope, $http, $ionicPopup) {
  $scope.getRequestsFunction = function() {
  $http({
      method: 'get',
      url: 'http://supremedev.usermd.net/ponioApp/php/getRequests.php',
  }).then(function successCallback(data) {
      if (angular.isArray(data.data)){
        $scope.requests = data.data;
        return;
      }
      if (data.data == 'Something went wrong'){
        $scope.requests = [];
        return;
      }
      else {
        $scope.requests = [];
        return;
      }
    })
  }

  $scope.getRequestsFunction();

  $scope.accept = function(item){
    $http({
      method: 'post',
      url: 'http://supremedev.usermd.net/ponioApp/php/acceptRequest.php',
      data: {
      username: item.username,
      unique_id: item.unique_id,
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data) {
      if(data.data == 'Success'){
        var alertPopup = $ionicPopup.alert({
          title: 'Udało się !',
          template: 'Konto zostało zautentykowane. Użytkownik może się zalogować do systemu!'
        });
        $scope.getRequestsFunction();
        return;
      }
      else {
        var alertPopup = $ionicPopup.alert({
          title: 'Błąd !',
          template: 'Wystąpił Błąd. Proszę spróbować ponownie!'
        });
        $scope.getRequestsFunction();
        return;
      }
      })
  }
  $scope.remove = function(item){
    $http({
      method: 'post',
      url: 'http://supremedev.usermd.net/ponioApp/php/deleteRequest.php',
      data: {
      username: item.username,
      unique_id: item.unique_id,
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data) {
      if(data.data == 'Success'){
        var alertPopup = $ionicPopup.alert({
          title: 'Usunięto !',
          template: 'Konto zostało odrzucone. Użytkownik nie będzie mógł zalogować się do systemu!'
        });
        $scope.getRequestsFunction();
        return;
      }
      else {
        var alertPopup = $ionicPopup.alert({
          title: 'Błąd !',
          template: 'Wystąpił Błąd. Proszę spróbować ponownie!'
        });
        $scope.getRequestsFunction();
        return;
      }
      })
  }
});
