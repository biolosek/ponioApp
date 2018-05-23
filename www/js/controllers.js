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
                  $rootScope.connectWebSocket();
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
                if ($scope.myResponse[0].active == 3 ) {
                  var alertPopup = $ionicPopup.alert({
                    title: 'Błąd !',
                    template: 'Twoje konto zostało zablokowane.'
                  });
                  return;
                }
                if ($scope.myResponse[0].active == 4 ) {
                  var alertPopup = $ionicPopup.alert({
                    title: 'Błąd !',
                    template: 'Twoje konto zostało zbanowane.'
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

.controller('ChatsCtrl', function($scope, $http, $ionicPopup, $rootScope, $ionicScrollDelegate) {
  $rootScope.webSocket.onmessage = function (event) {
     var messageArray = event.data.split("|");
     if (messageArray[1] == "newMessage" || messageArray[1] == "markedRead" || messageArray[1] == "friendAccepted" || messageArray[1] == "friendDeclined" || messageArray[1] == "deletedFriend" || messageArray[1] == "newFriend"){
       $rootScope.getFriends();
       $scope.getFriendRequestsFunction();
     }
     if (messageArray[1] == "bannedAccount" || messageArray[1] == "madeAdmin" || messageArray[1] == "adminDeleted"){
       $rootScope.checkAuth();
     }
   }
  $scope.friendOptions = function(item) {
    $scope.closeOptionsPopup = function(){
      optionsPopup.close();
    }
    $scope.thisFriend = item;
    var optionsPopup = $ionicPopup.show({
      template: '<a href="#/tab/chats/{{thisFriend.unique_id}}" ng-click="closeOptionsPopup();" class="button button-block button-balanced">Otwórz Czat</a><button ng-click="showEditFriendPopup(thisFriend); closeOptionsPopup();" class="button button-block button-energized">Edytuj Nazwę</button><button ng-click="deleteFriend(thisFriend); closeOptionsPopup();" class="button button-block button-assertive">Usuń z Listy</button>',
      title: 'Opcje Znajomego',
      scope: $scope,
      buttons: [
        { text: 'Anuluj',
          type: 'button-outline button-dark', },
      ]
    });
  }

  $scope.acceptFriend = function(item) {
    $http({
        method: 'post',
        url: 'http://supremedev.usermd.net/ponioApp/php/acceptFriend.php',
        data: {
        user1: item.user_1,
        unique_id: $rootScope.unique_id,
        },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data) {
        if(data.data == 'Success'){
          var alertPopup = $ionicPopup.alert({
            title: 'Udało się !',
            template: 'Zaproszenie do znajomych zostało zaakceptowane!'
          });
          $rootScope.webSocket.send(item.user_1 + "|" + $rootScope.unique_id  + "|" + 'friendAccepted');
          $scope.getFriendRequestsFunction();
          $rootScope.getFriends();
        }
        else {
          var alertPopup = $ionicPopup.alert({
            title: 'Błąd !',
            template: 'Wystąpił błąd, proszę spróbować ponownie!'
          });
          $scope.getFriendRequestsFunction();
          $rootScope.getFriends();
        }
      })
  }

  $scope.declineFriend = function(item) {
    $http({
        method: 'post',
        url: 'http://supremedev.usermd.net/ponioApp/php/declineFriend.php',
        data: {
        user1: item.user_1,
        unique_id: $rootScope.unique_id,
        },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data) {
        if(data.data == 'Success'){
          var alertPopup = $ionicPopup.alert({
            title: 'Udało się !',
            template: 'Zaproszenie do znajomych zostało odrzucone!'
          });
          $rootScope.webSocket.send(item.user_1 + "|" + $rootScope.unique_id  + "|" + 'friendDeclined');
        }
        else {
          var alertPopup = $ionicPopup.alert({
            title: 'Błąd !',
            template: 'Wystąpił błąd, proszę spróbować ponownie!'
          });
        }
        $scope.getFriendRequestsFunction();
        $rootScope.getFriends();
      })
  }

  $scope.goTop = function(){
    $ionicScrollDelegate.scrollTop();
  }

  $rootScope.getFriends = function() {
    $scope.friendsList = [];
    var friendsList = [];
    $http({
        method: 'post',
        url: 'http://supremedev.usermd.net/ponioApp/php/getFriends.php',
        data: {
        unique_id: $rootScope.unique_id,
        },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data) {
        if (angular.isArray(data.data)){
          $scope.friends = data.data;
          angular.forEach($scope.friends, function(value,key){
            if(value['user_1'] == $rootScope.unique_id){friendsList.push( {id : value['account_contact_id'], unique_id : value['user_2'], name : value['username'], unread : value['unread']} )};
            if(value['user_2'] == $rootScope.unique_id){friendsList.push( {id : value['account_contact_id'], unique_id : value['user_1'], name : value['username'], unread : value['unread']} )};
          });
          $scope.friendsList = friendsList;
          return;
        }
        if (data.data == 'Something went wrong'){
          $scope.friends = [];
          return;
        }
        else {
          $scope.friends = [];
          return;
        }
      })
  }

  $rootScope.getFriends();

  $scope.getFriendRequestsFunction = function() {
    $http({
        method: 'post',
        url: 'http://supremedev.usermd.net/ponioApp/php/friendRequests.php',
        data: {
        unique_id: $rootScope.unique_id,
        },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data) {
        if (angular.isArray(data.data)){
          $scope.friendRequests = data.data;
          return;
        }
        if (data.data == 'Something went wrong'){
          $scope.friendRequests = [];
          return;
        }
        else {
          $scope.friendRequests = [];
          return;
        }
      })
  }

  $scope.getFriendRequestsFunction();

  $scope.showEditFriendPopup = function(item) {
    $scope.friendName = null;
    var addFriendPopup = $ionicPopup.show({
      template: '<input type="text" placeholder="Nazwa Użytkownika" ng-model="$parent.friendName">',
      title: 'Proszę podać nową nazwe znajomego',
      scope: $scope,
      buttons: [
        { text: 'Anuluj',
          type: 'button-assertive', },
        {
          text: '<b>Zmień Nazwę</b>',
          type: 'button-balanced',
          onTap: function(e) {
            $http({
              method: 'post',
              url: 'http://supremedev.usermd.net/ponioApp/php/editFriend.php',
              data: {
              user1: $rootScope.unique_id,
              user2: $scope.thisFriend.unique_id,
              name: $scope.friendName,
              },
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
          .then(function successCallback(data){
            if (data.data == 'Success'){
              var alertPopup = $ionicPopup.alert({
                title: 'Udało się !',
                template: 'Nazwa znajomego została zmieniona!'
              });
              $scope.closeOptionsPopup();
              $rootScope.getFriends();
            }
            else {
              var alertPopup = $ionicPopup.alert({
                title: 'Błąd !',
                template: 'Wystąpił błąd, proszę spróbować ponownie!'
              });
              $scope.closeOptionsPopup();
              $rootScope.getFriends();
            }
          })
            }
          }
      ]
    });
   };

  $scope.deleteFriend = function(item) {
    $scope.thisFriendDelete = item;
    $http({
      method: 'post',
      url: 'http://supremedev.usermd.net/ponioApp/php/deleteFriend.php',
      data: {
      contact_id: $scope.thisFriendDelete.id,
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function successCallback(data){
      if(data.data == 'Success'){
        var alertPopup = $ionicPopup.alert({
          title: 'Udało się !',
          template: 'Znajomy został usunięty z listy!'
        });
        $rootScope.getFriends();
        $rootScope.webSocket.send($scope.thisFriendDelete.unique_id + "|" + $rootScope.unique_id  + "|" + 'deletedFriend');
      }
        else {
          var alertPopup = $ionicPopup.alert({
            title: 'Błąd !',
            template: 'Wystąpił błąd, proszę spróbować ponownie!'
          });
          $rootScope.getFriends();
        }
      })
    }

  $scope.showAddFriendPopup = function() {
    $scope.addFriendNumber = null;

    var addFriendPopup = $ionicPopup.show({
      template: '<input type="text" placeholder="Numer Użytkownika" ng-model="$parent.addFriendNumber">',
      title: 'Proszę podać numer użytkownika',
      scope: $scope,
      buttons: [
        { text: 'Anuluj',
          type: 'button-assertive', },
        {
          text: '<b>Dodaj</b>',
          type: 'button-balanced',
          onTap: function(e) {
            $http({
              method: 'post',
              url: 'http://supremedev.usermd.net/ponioApp/php/addFriend.php',
              data: {
              user1: $rootScope.unique_id,
              user2: $scope.addFriendNumber,
              },
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
          .then(function successCallback(data){
            if (data.data == 'Success'){
              var alertPopup = $ionicPopup.alert({
                title: 'Udało się !',
                template: 'Twoje zaproszenie do znajomych zostało wysłane!'
              });
              $rootScope.webSocket.send($scope.addFriendNumber + "|" + $rootScope.unique_id  + "|" + 'newFriend');
            }
            else {
              var alertPopup = $ionicPopup.alert({
                title: 'Błąd !',
                template: 'Wystąpił błąd, proszę spróbować ponownie! Upewnij się że podałeś prawidłowy numer!'
              });
            }
          })
            }
          }
      ]
    });
   };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, $http, $rootScope, $timeout, $ionicScrollDelegate) {
  $rootScope.webSocket.onmessage = function (event) {
     var messageArray = event.data.split("|");
     if (messageArray[1] == "newMessage" || messageArray[1] == "markedRead" || messageArray[1] == "friendAccepted" || messageArray[1] == "friendDeclined" || messageArray[1] == "deletedFriend" || messageArray[1] == "newFriend"){
       $rootScope.getFriends();
       $scope.getFriendRequestsFunction();
     }
     if (messageArray[1] == "bannedAccount" || messageArray[1] == "madeAdmin" || messageArray[1] == "adminDeleted"){
       $rootScope.checkAuth();
     }
   }
  $scope.getChatDetails = function() {
    $scope.thisChat = [];
    var thisChatDetails = [];
    $http({
      method: 'post',
      url: 'http://supremedev.usermd.net/ponioApp/php/chatDetails.php',
      data: {
      user_1: $rootScope.unique_id,
      user_2: $stateParams.chatId,
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data){
      if (angular.isArray(data.data)){
        $scope.thisChat = data.data;
        angular.forEach($scope.thisChat, function(value,key){
          if(value['user_1'] == $rootScope.unique_id){thisChatDetails.push( {id : value['account_contact_id'], unique_id : value['user_2'], name : value['username']} )};
          if(value['user_2'] == $rootScope.unique_id){thisChatDetails.push( {id : value['account_contact_id'], unique_id : value['user_1'], name : value['username']} )};
        });
        $scope.thisChatDetails = thisChatDetails;
        return;
      }
      if (data.data == 'Something went wrong'){
        $scope.thisChat = [];
        return;
      }
      else {
        $scope.thisChat = [];
        return;
      }
    })
  };
  $scope.getMessages = function(){
    $scope.thisMessages = [];
    var thisChatMessages = [];
    $http({
      method: 'post',
      url: 'http://supremedev.usermd.net/ponioApp/php/getMessages.php',
      data: {
      user_1: $rootScope.unique_id,
      user_2: $stateParams.chatId,
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data){
      if (angular.isArray(data.data)){
        $scope.thisMessages = data.data;
        angular.forEach($scope.thisMessages, function(value,key){
          if(value['from_account_id'] == $rootScope.unique_id){thisChatMessages.push( {id : value['message_id'], from_message_id : value['from_message_id'], for_account_id : value['for_account_id'], date_sent : value['date_sent'], date_read : value['date_read'], message : value['message'], color : "#f8f8f8"} )};
          if(value['for_account_id'] == $rootScope.unique_id){thisChatMessages.push( {id : value['message_id'], from_message_id : value['from_message_id'], for_account_id : value['for_account_id'], date_sent : value['date_sent'], date_read : value['date_read'], message : value['message'], color: "#11c1f3"} )};
        });
        $scope.thisChatMessages = thisChatMessages;
        $ionicScrollDelegate.scrollBottom();
        return;
      }
      if (data.data == 'Something went wrong'){
        $scope.thisMessages = [];
        return;
      }
      else {
        $scope.thisMessages = [];
        return;
      }
    })
  };
  $rootScope.webSocket.onmessage = function (event) {
     var messageArray = event.data.split("|");
     if (messageArray[1] == "newMessage" || messageArray[1] == "markedRead"){
       $scope.thisMessages = [];
       var thisChatMessages = [];
       $http({
         method: 'post',
         url: 'http://supremedev.usermd.net/ponioApp/php/getMessages.php',
         data: {
         user_1: $rootScope.unique_id,
         user_2: messageArray[0],
         },
         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
       }).then(function successCallback(data){
         if (angular.isArray(data.data)){
           $scope.thisMessages = data.data;
           angular.forEach($scope.thisMessages, function(value,key){
             if(value['from_account_id'] == $rootScope.unique_id){thisChatMessages.push( {id : value['message_id'], from_message_id : value['from_message_id'], for_account_id : value['for_account_id'], date_sent : value['date_sent'], date_read : value['date_read'], message : value['message'], color : "#f8f8f8"} )};
             if(value['for_account_id'] == $rootScope.unique_id){thisChatMessages.push( {id : value['message_id'], from_message_id : value['from_message_id'], for_account_id : value['for_account_id'], date_sent : value['date_sent'], date_read : value['date_read'], message : value['message'], color: "#11c1f3"} )};
           });
           $scope.thisChatMessages = thisChatMessages;
           $ionicScrollDelegate.scrollBottom();
           $rootScope.getFriends();
           return;
         }
         if (data.data == 'Something went wrong'){
           $scope.thisMessages = [];
           return;
         }
         else {
           $scope.thisMessages = [];
           return;
         }
       })
     }
  }
  $scope.markAsRead = function(){
    angular.forEach($scope.thisChatMessages, function(value, key){
      if (value['date_read'] == null && value['for_account_id'] == $rootScope.unique_id){
        $http({
          method: 'post',
          url: 'http://supremedev.usermd.net/ponioApp/php/markAsRead.php',
          data: {
          message_id: value['id'],
          for_account_id: $rootScope.unique_id,
          },
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function successCallback(data){
          $rootScope.webSocket.send($stateParams.chatId + "|" + $rootScope.unique_id  + "|" + 'markedRead');
          $scope.getMessages();
          $rootScope.getFriends();
        })
    }
    })
  };
  $scope.sendMessage = function(for_account_id, message){
    if(for_account_id != null && message != null){
    $http({
      method: 'post',
      url: 'http://supremedev.usermd.net/ponioApp/php/sendMessage.php',
      data: {
      from_account_id: $rootScope.unique_id,
      for_account_id: for_account_id,
      message: message,
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data){
      $scope.thisMessage = null;
      $scope.getMessages();
      $rootScope.webSocket.send($stateParams.chatId + "|" + $rootScope.unique_id  + "|" + 'newMessage');
      $scope.markAsRead();
    })
  }
  }
  $scope.getChatDetails();
  $scope.getMessages();
})

.controller('AccountCtrl', function($scope, $rootScope, $window, $ionicPopup, $http) {
  $rootScope.webSocket.onmessage = function (event) {
     var messageArray = event.data.split("|");
     if (messageArray[1] == "bannedAccount" || messageArray[1] == "madeAdmin" || messageArray[1] == "adminDeleted"){
       $rootScope.checkAuth();
     }
   }
  $scope.deactivateAccountFunction = function() {
    var deactivateAccountPopup = $ionicPopup.show({
      template: '<button ng-click="confirmDeactivation();" class="button button-block button-balanced">Tak jestem pewien.</button>',
      title: 'Czy jesteś pewien swojej decyzji ?',
      scope: $scope,
      buttons: [
        { text: 'Tylko Żartowałem !',
          type: 'button-assertive', }
      ]
    });
   };
   $scope.confirmDeactivation = function(){
     $http({
       method: 'post',
       url: 'http://supremedev.usermd.net/ponioApp/php/deactivateAccount.php',
       data: {
         unique_id: $rootScope.unique_id,
       },
       headers: {'Content-Type': 'application/x-www-form-urlencoded'}
     }).then(function successCallback(data){
       if (data.data == "Success") {
          $rootScope.logout();
          var alertPopup = $ionicPopup.alert({
             title: 'Udało się !',
             template: 'Twoje konto zostało zablokowane.'
           });
          return;
       }
       else {
         var alertPopup = $ionicPopup.alert({
            title: 'Błąd !',
            template: 'Wystąpił błąd. Proszę spróbować ponownie.'
          });
          return;
       }
     })
   }

   $scope.clearDatabase = function() {
     $scope.closeClearDatabasePopup = function(){
       clearDatabasePopup.close();
     }
     var clearDatabasePopup = $ionicPopup.show({
       template: '<button ng-click="confirmClearDatabase(); closeClearDatabasePopup();" class="button button-block button-balanced">Tak jestem pewien.</button>',
       title: 'Czy jesteś pewien swojej decyzji ? Wyczyszczenie bazy danych aplikacji jest nieodwracalne !',
       scope: $scope,
       buttons: [
         { text: 'Tylko Żartowałem !',
           type: 'button-assertive', }
       ]
     });
    };
    $scope.confirmClearDatabase = function(){
      $http({
        method: 'post',
        url: 'http://supremedev.usermd.net/ponioApp/php/clearDatabase.php',
        data: {
          unique_id: $rootScope.unique_id,
          role: $rootScope.role,
        },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function successCallback(data){
        if (data.data == "Success") {
           var alertPopup = $ionicPopup.alert({
              title: 'Udało się !',
              template: 'Baza danych została wyczyszczona, jedyna pozostałość to Twoje konto.'
            });
           return;
        }
        else {
          var alertPopup = $ionicPopup.alert({
             title: 'Błąd !',
             template: 'Wystąpił błąd. Proszę spróbować ponownie.'
           });
           return;
        }
      })
    }

   $scope.saveSetting = function(){
     window.localStorage['negative'] = $rootScope.negative;
     window.localStorage['count'] = $rootScope.count;
     window.localStorage['myNumber'] = $rootScope.myNumber;
   }

    $scope.changePasswordFunction = function() {
    $scope.changePasswordData = {};

    var changePasswordPopup = $ionicPopup.show({
      template: '<input type="password" placeholder="Stare Hasło" ng-model="changePasswordData.passwordold"></br><input type="password" placeholder="Nowe Hasło" ng-model="changePasswordData.passwordnew"></br><input type="password" placeholder="Powtórz Nowe Hasło" ng-model="repeatpassword"></br><span ng-show="changePasswordData.passwordnew != repeatpassword" class="redSpan"><b>Hasła nie są identyczne!</b></span>',
      title: 'Proszę podać dane do zmiany hasła',
      scope: $scope,
      buttons: [
        { text: 'Anuluj',
          type: 'button-assertive', },
        {
          text: '<b>Potwierdź</b>',
          type: 'button-balanced',
          onTap: function(e) {
            $http({
              method: 'post',
              url: 'http://supremedev.usermd.net/ponioApp/php/changePassword.php',
              data: {
              unique_id: $rootScope.unique_id,
              passwordold: $scope.changePasswordData.passwordold,
              passwordnew: $scope.changePasswordData.passwordnew,
              },
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
          .then(function successCallback(data){
            if (data.data == "Success") {
              var alertPopup = $ionicPopup.alert({
                 title: 'Udało się !',
                 template: 'Twoje hasło zostało zmienione. Zaloguj się przy pomocy nowego hasła !'
               });
               $rootScope.logout();
               return;
            }
            if (data.data == "Incorrect password") {
              var alertPopup = $ionicPopup.alert({
                title: 'Błąd !',
                template: 'Podałeś błędne hasło. Spróbuj ponownie'
              });
              return;
            }
            if (data.data == "Something went wrong") {
              var alertPopup = $ionicPopup.alert({
                title: 'Błąd !',
                template: 'Wystąpił błąd, proszę spróbować ponownie'
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

.controller('RequestsCtrl', function($scope, $http, $ionicPopup, $rootScope) {
  $rootScope.webSocket.onmessage = function (event) {
     var messageArray = event.data.split("|");
     if (messageArray[1] == "bannedAccount" || messageArray[1] == "madeAdmin" || messageArray[1] == "adminDeleted"){
       $rootScope.checkAuth();
     }
   }
  $scope.makeAdmin = function(item) {
    $http({
      method: 'post',
      url: 'http://supremedev.usermd.net/ponioApp/php/makeAdmin.php',
      data: {
        unique_id: item.unique_id,
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data){
      if(data.data == "Success"){
        var alertPopup = $ionicPopup.alert({
          title: 'Udało się !',
          template: 'Admin został przyznany do wybranego konta!'
        });
        $scope.getAccountsFunction();
        $rootScope.webSocket.send(item.unique_id + "|" + $rootScope.unique_id  + "|" + 'madeAdmin');
        return;
      }
      else {
        var alertPopup = $ionicPopup.alert({
          title: 'Błąd !',
          template: 'Wystąpił nieoczekiwany błąd, spróbuj później!'
        });
        $scope.getAccountsFunction();
        return;
      }
    })
  };
  $scope.unbanAccount = function(item) {
    $http({
      method: 'post',
      url: 'http://supremedev.usermd.net/ponioApp/php/unbanAccount.php',
      data: {
        unique_id: item.unique_id,
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data){
      if(data.data == "Success"){
        var alertPopup = $ionicPopup.alert({
          title: 'Udało się !',
          template: 'Wybrane konto zostało odblokowane!'
        });
        $scope.getAccountsFunction();
        return;
      }
      else {
        var alertPopup = $ionicPopup.alert({
          title: 'Błąd !',
          template: 'Wystąpił nieoczekiwany błąd, spróbuj później!'
        });
        $scope.getAccountsFunction();
        return;
      }
    })
  };
  $scope.banAccount = function(item) {
    $http({
      method: 'post',
      url: 'http://supremedev.usermd.net/ponioApp/php/banAccount.php',
      data: {
        unique_id: item.unique_id,
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data){
      if(data.data == "Success"){
        var alertPopup = $ionicPopup.alert({
          title: 'Udało się !',
          template: 'Wybrane konto zostało zbanowane!'
        });
        $scope.getAccountsFunction();
        $rootScope.webSocket.send(item.unique_id + "|" + $rootScope.unique_id  + "|" + 'bannedAccount');
        return;
      }
      else {
        var alertPopup = $ionicPopup.alert({
          title: 'Błąd !',
          template: 'Wystąpił nieoczekiwany błąd, spróbuj później!'
        });
        $scope.getAccountsFunction();
        return;
      }
    })
  };
  $scope.deleteAdmin = function(item) {
    $http({
      method: 'post',
      url: 'http://supremedev.usermd.net/ponioApp/php/deleteAdmin.php',
      data: {
        unique_id: item.unique_id,
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(data){
      if(data.data == "Success"){
        var alertPopup = $ionicPopup.alert({
          title: 'Udało się !',
          template: 'Admin został odebrany wybranemu kontu!'
        });
        $scope.getAccountsFunction();
        $rootScope.webSocket.send(item.unique_id + "|" + $rootScope.unique_id  + "|" + 'adminDeleted');
        return;
      }
      else {
        var alertPopup = $ionicPopup.alert({
          title: 'Błąd !',
          template: 'Wystąpił nieoczekiwany błąd, spróbuj później!'
        });
        $scope.getAccountsFunction();
        return;
      }
    })
  };
  $scope.getAccountsFunction = function() {
    $http({
      method: 'get',
      url: 'http://supremedev.usermd.net/ponioApp/php/getAllAccounts.php'
    }).then(function successCallback(data){
      if(angular.isArray(data.data)){
        $scope.allAccounts = data.data;
        return;
      }
      else {
        $scope.allAccounts = [];
        return;
      }
    })
  }
  $scope.getAccountsFunction();
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
    $scope.getAccountsFunction();
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
