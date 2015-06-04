(function() {
    angular.module('app.services.dataStorage', [])

.factory('DataStorage', ["$q", "$rootScope", "Network", "Toast", function($q, $rootScope, Network, Toast){
        var data = [];
        var updateLocalStorage = function() {
            window.localStorage['data'] = JSON.stringify(data);
        }
        
        var getUserInfo = function() {
            var deferred = $q.defer();
            intel.security.secureStorage.read(
            function(instanceID){
                return intel.security.secureData.getData(
                    function(data){
                        data = JSON.parse(data);
                        deferred.resolve(data);
                    }, 
                    function(errorObj){
                        console.log('fail: code = '+errorObj.code+', message = '+errorObj.message);
                    }, instanceID

                ); 
            },
            function(errorObj){
                console.log('fail: code = '+errorObj.code+', message = '+errorObj.message);
                return undefined;
            },{'id':'1'})
            return deferred.promise;
        }

        
    var getData = function() {
        return data;
    }
    var getDispatch = function(id) {
        console.log("getpallets"+id)
        for(var i = 0; i<data.length; i++)
            if(data[i].dispatch == id)
                return data[i];
        return null;
    }
    var palletExist = function(id) {
        for(var i = 0; i<data.length; i++)
            for(var j = 0; i<data[i].pallets.length; i++)
                if(id == data[i].pallets[j].StoolID)
                    return data[i].dispatch;
        return null;
    }
    var dispatchExist = function(id) {
        if(getDispatch(id))
            return true;
        else
            return false;
    }
    var sync = function() {
        data = JSON.parse(window.localStorage['data'] || '[]');
        var syncData = [];
        var deferred = $q.defer();
    if(window.localStorage['syncData']){
        console.log("unsynced data")
        Network.post().then(function(succes){
            moveToSynced();
            window.localStorage.removeItem('syncData');
            sync().then(function(success){
                deferred.resolve();
            });
        })
    }
    else{
        Network.dbTestData().then(function(success){
            if(success[0].data[0].DeliveryNoteNumber == "Invalid token")
            {
                getUserInfo().then(function(success){
                    Network.login(success.username, success.password).then(function(data){
                        window.localStorage.setItem("token", data[0].Token)
                        sync().then(function(success){
                            deferred.resolve();
                        });
                    }, function(fail){
                        console.log(fail);
                    })
                })
            }
            else{
                for(var i =0; i < success.length; i++)
                    for(var j =0; j < success[i].data.length; j++)
                        syncData.push(success[i].data[j]);
                structure(syncData);
                deferred.resolve();     
            }
        },function(fail){
            console.log("fail in datastorage");
            deferred.resolve();
        })
    }   
        return deferred.promise
        }
    
        function structure(indata) {
            var groups = {};

            for(var i = 0; i < indata.length; i++) {
                var item = indata[i];

                if(!groups[item.DeliveryNoteNumber]) {
                    groups[item.DeliveryNoteNumber] = [];
                }
                item["status"] = "unchecked";
                groups[item.DeliveryNoteNumber].push(item);
            }
            
            for(var i = 0; i < data.length; i++){
                if(groups[data[i].dispatch]){
                    console.log("found existing dispatch")
                    delete groups[data[i].dispatch]
                }
            }

            for(var x in groups) {
                if(groups.hasOwnProperty(x)) {
                    console.log("group has dispatch" + x);
                    var obj = {};
                    obj["dispatch"] = x;
                    obj["status"] = "incoming";
                    obj["checkedPallets"] = 0;
                    obj["numPallets"] = groups[x].length;
                    obj["customerID"] = (groups[x])[0].CustomerID;
                    obj["supplierID"] = (groups[x])[0].SupplierID;
                    obj["pallets"] = groups[x];
                    data.push(obj);
                }
            }
            updateLocalStorage();
    }
        var addSyncData = function(dispatch) {
            console.log("addsyncdata"+dispatch.dispatch);
            var syncData = JSON.parse(window.localStorage['syncData'] || '[]');
            var obj = {};
            obj["DeliveryNoteNumber"] = dispatch.dispatch;
            var pallets = [];
            for(var i = 0; i < dispatch.pallets.length; i++)
                if(dispatch.pallets[i].status != "confirmed")
                   pallets.push({StoolID: dispatch.pallets[i].StoolID, Qty: dispatch.pallets[i].Qty})
            if(pallets.length > 0)
                obj["pallets"] = [];
            syncData.push(obj)
            window.localStorage["syncData"] =  JSON.stringify(syncData);
        }
        
        var moveToSynced = function(){
            console.log("moveToSynced")
            var syncData = JSON.parse(window.localStorage['syncData']);
            var history = JSON.parse(window.localStorage['history'] || '[]')
            for(var i = 0; i < data.length; i++)
            {
                //checks if items of syncdata contains a dispatch
                if(syncData.some(function(item){
                    return item.DeliveryNoteNumber == data[i].dispatch
                })){
                    //if it does put it in history and remove it from data
                    var syncitem = data.splice(i,1)[0]
                    syncitem["status"]="synced";
                    history.push(syncitem);
                }
                console.log(data);
            }
            updateLocalStorage();
            console.log("store history")
            window.localStorage['history'] = JSON.stringify(history);
        }
        
        var getHistory = function() {
            return JSON.parse(window.localStorage['history'] || '[]')
        }
    return {
        getData : function(){
            return getData();
        },
        sync : function(){
            return sync();
        },
        getDispatch : function(id) {
            return getDispatch(id);
        },
        palletExist: function(id){
            return palletExist(id);
        },
        dispatchExist: function(id){
            return dispatchExist(id);
        },
        getUserInfo: function() {
            return getUserInfo();
        },
        addSyncData: function(dispatch) {
            return addSyncData(dispatch);
        },
        updateLocalStorage: function(){
            return updateLocalStorage();
        },
        clearData: function() {
            data = [];
        },
        getHistory: function(){
            return getHistory();
        }
    }
    
}])
}())