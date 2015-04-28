(function() {
    angular.module('app.services', [])
    
// Intercepts 401 https statuses
.factory('AuthInterceptor', function ($rootScope, $q) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: 'event:auth-loginRequired',
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
 
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})

.factory('MenuService', function(){
    var userName = "";
    var menuItems =
        [{ text: 'Home', iconClass: 'icon ion-home', link: 'menu.home'},
         { text: 'History',iconClass: 'icon ion-filing', link: 'menu.history'},
         { text: 'Help', iconClass: 'icon ion-help-circled',  link: 'menu.help'},
         { text: 'About',iconClass: 'icon ion-information-circled', link: 'menu.about'},
         { text: 'Sign out', iconClass:  'icon ion-log-out', link: 'signin'}
        ];
    
    return {
        items: function() {
            return menuItems;
        },
        userName: function(){
            return userName;
        }
    }
})

.factory('ScanService', function($q){
        
        var scan = function(){

        var deferred = $q.defer();
        try {
            cordova.plugins.barcodeScanner.scan(
                function (result) {  // success
                    deferred.resolve(result);
                }, 
                function (error) {  // failure
                    deferred.rejet(error.toString());
                }
            );
        }
        catch (exc) {
            deferred.reject({'error':true, 'result': 'exception: ' + exc.toString()});
        }
        return deferred.promise;
        }
    return{
        scan : scan
    }

})
.factory('ToastService', function($q, $window){
        
        var toast = function(message){
            var deferred = $q.defer();
        try {
            $window.plugins.toast.showLongTop(message, 
                function (result) {
                    deferred.resolve(result);
                }, 
                function (error) {  // failure
                    deferred.reject(error);
                });
        }
        catch (exc) {
            deferred.reject(exc)
            console.log("fail");
        }
            return deferred.promise;
        }
        
    return{
        toast : toast
    }

})
.factory('SigninService',  function(MenuService, $window, $http, $rootScope){
    
    var LOCAL_TOKEN_KEY = 'token';
    var isAuthenticated = false;
    var authToken;
    
    var login = function(name, password){
        
        $http.post('https://login', {username : name , password: password})
        .success(function(data){
            console.log('success');

            //if the user data is correct, set it in localStorage(for now)
            var user =  { username: name, password: password};
            window.localStorage['user'] = JSON.stringify(user);

            authToken = data.authorizationToken;
            storeToken(authToken)
            
            // Sets the token as header for all requests
            $http.defaults.headers.common.Authorization = authToken;
            $rootScope.$broadcast('event:auth-loginConfirmed', status);         
            
        })
        .error(function(data, status, headers, config){
            $rootScope.$broadcast('event:auth-login-failed', status);
        })
    }
    
    var storeToken = function(authToken){
        window.localStorage.setItem(LOCAL_TOKEN_KEY, authToken);
        isAuthenticated = true;
        window.localStorage['loggedIn'] = 'true';
    }
        
    var logout = function(){
        authToken = undefined;
        isAuthenticated = false;
        
        
        //Cant remove more than 1 item at a time? 
        window.localStorage.removeItem(LOCAL_TOKEN_KEY, ' ');
        window.localStorage.removeItem('user');
        window.localStorage.setItem('loggedIn', 'false');
        
        delete $http.defaults.headers.common.Authorization;
    }
    
    return{
        login: function(name, password){
            return login(name, password);
        },
        logout: function(){
            return logout()
        },
        isAuthenticated: function(){
            return isAuthenticated;
        }
    }
        
})

/*.factory('IDBService', function($q){
            //window.shimIndexedDB.__debug(true);
            var db = new Dexie("localSIM");
            db.version(1).stores({ dispatch: "id", pallet: "id, did", article:"id", order:"id", palletHas:"++,pid,aid,[pid,aid],order"});
            //test data
            db.on('ready', function () {
                db.dispatch.add({id: "N104", description: "CJ-TUBE-0140", date: "D040915", status: "incoming"});
                db.dispatch.add({id: "N105", description: "CJ-TUBE-0141", date: "D040915", status: "checked with errors"});
                db.dispatch.add({id: "N106", description: "CJ-TUBE-0142", date: "D040915", status: "partially checked"});
                db.dispatch.add({id: "N107", description: "CJ-TUBE-0143", date: "D040915", status: "checked"});
                db.pallet.add({id:"S376", did:"N104", quantity: "5", weight: "30", status: "unchecked"});
                db.pallet.add({id:"S377", did:"N104", quantity: "10", weight: "300", status: "unchecked"});
                db.pallet.add({id:"S380", did:"N105", quantity: "1", weight: "320", status: "unchecked"});
                db.pallet.add({id:"S381", did:"N105", quantity: "14", weight: "34", status: "unchecked"});
                db.article.add({id: "P407300"});
                db.article.add({id: "P407305"});
                db.order.add({id:"AK029250"});
                db.order.add({id:"AK028890"});
                db.palletHas.add({pid:"S376", aid:"P407300", quantity:"5", order:"AK029250"});
                db.palletHas.add({pid:"S376", aid:"P407305", quantity:"8", order:"AK028890"});
                db.palletHas.add({pid:"S377", aid:"P407306", quantity:"1", order:"AK029295"});
                db.palletHas.add({pid:"S377", aid:"P407307", quantity:"2", order:"AK028899"});
            });
            db.open();
        
        var getDispatches = function(){
            var deferred = $q.defer();
            db.dispatch.toArray(function(result) {
                console.log(JSON.stringify(result));
                deferred.resolve(result);
            }); 
            db.pallet.toArray(function(result) {
                console.log(JSON.stringify(result))});                             
            return deferred.promise;
            };
        
        var getPallets = function(id){
            console.log("in pallets"+id);
            var deferred = $q.defer();
            db.pallet.where("did").equals(id).toArray(function(result) {
                            console.log(JSON.stringify(result));
                            deferred.resolve(result);
                            });                   
            return deferred.promise;
        }
        var getPallet = function (id){
            console.log("palletid"+id);
            var deferred = $q.defer();
            db.palletHas.where("pid").equals(id).toArray(function(result) {
                console.log(JSON.stringify(result));
                deferred.resolve(result);
            });
            return deferred.promise;
        }
        var scanDispatch =  function(scanId){
            console.log("idtype:"+scanId);
            var deferred = $q.defer();
            db.dispatch.get(scanId).then(function(result) {
                
                if(result){
                        alert(JSON.stringify(result));
                        deferred.resolve({'dispatchId':result.id});
                }
            
            });
            return deferred.promise;
        }
        var scanPallet = function(scanId){
            var deferred = $q.defer();
            db.pallet.get(scanId).then(function(result) {
                console.log(result);
                        if(result){
                            alert(JSON.stringify(result));
                            deferred.resolve({'dispatchId':result.did,'palletId':result.id});
                         }
                         });
            
            return deferred.promise;
        }
        
        
         return {
             getDispatches: function() {
                 return getDispatches();
            },
             getPallets: function(id){
                 return getPallets(id);
            },
             getPallet: function(id){
                 return getPallet(id);
             },
             scanDispatch: function(id){
                 return scanDispatch(id);
            },   
             scanPallet: function(id){
                 return scanPallet(id);
            }
         }
})*/
.factory('DBService', function($q, ToastService){
        
        
        var db = new localStorageDB("LocalSIM", localStorage);
            
        // rows with thest data
        var dispatchrows = [
            {id: "N104", description: "CJ-TUBE-0140", date: "D040915", status: "incoming"},
            {id: "N105", description: "CJ-TUBE-0141", date: "D040915", status: "checked with errors"},
            {id: "N106", description: "CJ-TUBE-0142", date: "D040915", status: "partially checked"},
            {id: "N107", description: "CJ-TUBE-0143", date: "D040915", status: "checked"}
        ]
        var palletrows = [
            {id:"S376", did:"N104", quantity: "15", weight: "7.5", status: "unchecked", aid:"P407300", order:"AK029250"},
            {id:"S377", did:"N104", quantity: "80", weight: "40", status: "unchecked", aid:"P407305", order:"AK028890"},
            {id:"S378", did:"N104", quantity: "15", weight: "7.5", status: "unchecked", aid:"P407300", order:"AK029250"},
            {id:"S379", did:"N104", quantity: "80", weight: "40", status: "unchecked", aid:"P407305", order:"AK028890"},
            {id:"S380", did:"N104", quantity: "15", weight: "7.5", status: "unchecked", aid:"P407300", order:"AK029250"},
            {id:"S381", did:"N104", quantity: "80", weight: "40", status: "unchecked", aid:"P407305", order:"AK028890"},
            {id:"S382", did:"N104", quantity: "15", weight: "7.5", status: "unchecked", aid:"P407300", order:"AK029250"},
            {id:"S383", did:"N104", quantity: "80", weight: "40", status: "unchecked", aid:"P407305", order:"AK028890"},
            {id:"S384", did:"N104", quantity: "15", weight: "7.5", status: "unchecked", aid:"P407300", order:"AK029250"},
            {id:"S385", did:"N104", quantity: "80", weight: "40", status: "unchecked", aid:"P407305", order:"AK028890"},
            {id:"S386", did:"N104", quantity: "15", weight: "7.5", status: "unchecked", aid:"P407300", order:"AK029250"},
            {id:"S387", did:"N104", quantity: "80", weight: "40", status: "unchecked", aid:"P407305", order:"AK028890"},
            {id:"S388", did:"N104", quantity: "15", weight: "7.5", status: "unchecked", aid:"P407300", order:"AK029250"},
            {id:"S389", did:"N104", quantity: "80", weight: "40", status: "unchecked", aid:"P407305", order:"AK028890"},
            {id:"S390", did:"N104", quantity: "15", weight: "7.5", status: "unchecked", aid:"P407300", order:"AK029250"},
            {id:"S391", did:"N104", quantity: "80", weight: "40", status: "unchecked", aid:"P407305", order:"AK028890"},
            {id:"S392", did:"N104", quantity: "15", weight: "7.5", status: "unchecked", aid:"P407300", order:"AK029250"},
            {id:"S393", did:"N104", quantity: "80", weight: "40", status: "unchecked", aid:"P407305", order:"AK028890"},
            {id:"S394", did:"N104", quantity: "15", weight: "7.5", status: "unchecked", aid:"P407300", order:"AK029250"},
            {id:"S395", did:"N104", quantity: "80", weight: "40", status: "unchecked", aid:"P407305", order:"AK028890"}
        ]
        if(db.isNew()){    
        db.createTableWithData("dispatch", dispatchrows);
        db.createTableWithData("pallet", palletrows);
            
        db.commit();
        }
        var getDispatches = function(){
            var deferred = $q.defer();
            var result = db.queryAll("dispatch");
            console.log(result.length);
            if(result.length > 0)
                deferred.resolve(result);
            else
                deferred.reject("no local dispatches found")
            return deferred.promise;
            };
        
        var getPallets = function(id){
            var deferred = $q.defer();
            var result = db.queryAll("pallet", {
                query:{did: id}});
            if(result.length>0)
                deferred.resolve(result);
            else
                deferred.reject("no pallets found");         
            return deferred.promise;
        }
        var getPallet = function (id){
            var deferred = $q.defer();
            deferred.resolve(db.queryAll("pallet", {
                query:{pid: id}}));
            return deferred.promise;
        }
        var scanDispatch =  function(id){
            var deferred = $q.defer();
            console.log("in scandispatch: "+id)
            var result = db.queryAll("dispatch",{
                    query:{id:id}});
            console.log(result[0]);
            if(result.length)
                deferred.resolve({'dispatchId': result[0].id});
            else
                deferred.reject("Dispatch not found")
            return deferred.promise;
        }
        var scanPallet = function(id){
            alert("in scan pallet");
            var deferred = $q.defer();
            var result = db.queryAll("pallet", {
                query:{id: id}});
            alert(result);
            if(result.length>0)
                deferred.resolve({'dispatchId':result[0].did,'palletId':result[0].id});
            else
                deferred.reject("Pallet not found")
            return deferred.promise;
        }
        var scanOrder = function(id){
            alert("in scan order");
            var deferred = $q.defer();
            var result = db.queryAll("pallet", {
                query:{order: id}});
            alert(result);
            if(result.length>0)
                deferred.resolve({'dispatchId':result[0].did,'palletId':result[0].id});
            else
                deferred.reject("Order not found")
            return deferred.promise;
        }
        var setChecked = function(table,item){
            console.log(table,item.id)
            db.update(table,{id: item.id},
                     function(row){
                row.status = "checked"
                return row;
            })
            //emulate trigger
            if(table == "pallet")
            {
                console.log("table is a pallet")
                var pallets = db.queryAll(table,{query:{did:item.did}});
                console.log(pallets[0].status);
                var count = 0;
                for(var pallet in pallets){
                    console.log("inside pallets");
                    if (pallets[pallet].status == "checked"){
                        count++;
                    }      
                }
                console.log(count,pallets.length);
                if(count==pallets.length){
                    console.log("count==pallets.length")
                    var item2 = {id: item.did}
                    setChecked("dispatch", item2);
                    ToastService.toast("Dispatch: "+item.did+" marked as checked").then(function(success){console.log("toast success")},function(fail){console.log("toast fail")});
                }
            }
        }
        
        
         return {
             getDispatches: function() {
                 return getDispatches();
            },
             getPallets: function(id){
                 return getPallets(id);
            },
             getPallet: function(id){
                 return getPallet(id);
             },
             scanDispatch: function(id){
                 return scanDispatch(id);
            },   
             scanPallet: function(id){
                 return scanPallet(id);
            },
             setChecked: function(table,item){
                 return setChecked(table,item);
             }
         }
        
    })
}());