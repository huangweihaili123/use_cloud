
var app = angular.module('RDash');
app.register.controller("emailCtr", function ($scope, $http, $location, $uibModal,$interval,$timeout,$cookieStore,url_junction, baseUrl, $rootScope,listService,utils) {
    $scope.title = '站内信管理／我的站内信';
    $scope.params={
        date_start:'',
        date_end:'',
        state:'',
        pk:''
    };
    $scope.selections={
        order_state:{},
        order_type:{}
    }
    listService.init($scope,'/api/1/message/');
    $scope.afterShowData=function(){
        $scope.title='站内信管理／我的站内信/站内信详情';
        $scope.readMsg($scope.detail.id);
    }
    $scope.readMsg = function(ids){
        if(!ids){
            ids = [];
            angular.forEach($scope.selected,function(val,key){
                if(val){
                    ids.push(key);
                }
            });
            if(ids.length==0)return;
        }
        $http.put(baseUrl.getUrl()+'/api/1/message/',{messageId:ids.toString()}).success(function(data){
            if($scope.step==0)$scope.refresh();

            var sideScope =angular.element('div[ng-controller="sideBarCtrl"]').scope();
            sideScope.get_emailCount()
        });

    }
    $scope.afterBack=function(){
        $scope.title='站内信管理／我的站内信';
    }
    $scope.remove=function(ids){
        if(!ids){
            ids = [];
            angular.forEach($scope.selected,function(val,key){
                if(val){
                    ids.push(key);
                }
            });
            if(ids.length==0)return;
        }
        $http({
            method: 'delete',
            url: baseUrl.getUrl()+'/api/1/message/',
            data: {messageId:ids},
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function (obj) {
                var str = [];
                for (var p in obj) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
                return str.join("&");
            }
        }).success(function(data){
            if($scope.step==0)$scope.refresh();
        });
    }
    $scope.refresh();
    
    $timeout(function(){
        $('.date-picker').datepicker({
            language: 'zh',
            orientation: "left",
            todayHighlight: true,
            autoclose:true,
            templates:{
                leftArrow: '<i class="fa fa-angle-left"></i>',
                rightArrow: '<i class="fa fa-angle-right"></i>'
            }
        });
    });
})
