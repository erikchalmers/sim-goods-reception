(function(){ angular.module('app.signinCtrl', [])
.controller('SigninCtrl', ["$scope", "$state", "Signin", "$ionicLoading", "$ionicViewSwitcher", function($scope, $state, Signin, $ionicLoading, $ionicViewSwitcher) {

    $scope.errror = false;
    
    $scope.signIn = function(name, password){

            $ionicLoading.show({
            template: '<p class="item-icon-left">Loading... <ion-spinner icon="spiral"/></p>'
            })
            Signin.login(name,password);
        
    }

    //Event fires when the login has failed   
    $scope.$on('event:auth-login-failed', function(e, status) {
        console.log("login failed");
        alert('Login failed!')
        $ionicLoading.hide()
        $scope.error = true;
        //$state.go('signin')
    });
    
    //Event fires when the login is confirmed
    $scope.$on('event:auth-loginConfirmed', function() {
        console.log("login confirmed");
        //if($state.is('signin')){
            $ionicLoading.hide()
            $ionicViewSwitcher.nextDirection("forward"); 
            $state.go('menu.home');
        //}
            
    });

    //Event fires when server returns http 401 (unAuthenticated), tries to login the user again
    $scope.$on('event:auth-loginRequired', function(e, rejection) {
        var user = JSON.parse(window.localStorage['user'] || '{}');
        Signin.login(user.username, user.password);
  })

}])
}())