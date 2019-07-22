module.exports = function MenuCtrl($scope, $rootScope, SettingsService, UserService,
  $location, $http) {

  SettingsService.bind($scope, {
    target: 'lastUsedDevice'
  })

  SettingsService.bind($rootScope, {
    target: 'platform',
    defaultValue: 'native'
  })

  $scope.$on('$routeChangeSuccess', function() {
    $scope.isControlRoute = $location.path().search('/control') !== -1
  })
  console.log(`UserService.currentUser:${JSON.stringify(UserService.currentUser)}`)
  $scope.currentUser = UserService.currentUser

  $scope.logout = function() {
    $http({
      method: "GET",
      url: '/auth/api/v1/logout',
      timeout: 10000
    }).success(function(){
      location.reload();
    });
  }
}
