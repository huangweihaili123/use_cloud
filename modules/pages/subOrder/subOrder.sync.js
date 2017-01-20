
var app = angular.module('RDash');
app.register.controller("subOrderCtr", function ($scope, $http, $location, $uibModal,$interval,$cookieStore,$cookieStore,$timeout, baseUrl,utils) {
    $scope.title = '工单管理／提交工单';
    $scope.viewState = 0;
    $scope.step = function(step){
        $scope.reset();
        $scope.viewState=step;
        if(step==0){
            $scope.title = '工单管理／提交工单';
        }else if(step==1){
            $scope.title = '工单管理／提交工单/物接入相关';
            utils.getUploader('btn-upload-1',function(data,file){
                $scope.fieldSet.annex.push(data.key);
                $scope.$apply();
            });
        }else if(step==2){
            $scope.title = '工单管理／提交工单/规则引擎相关';
            utils.getUploader('btn-upload-2',function(data,file){
                $scope.fieldSet.annex.push(data.key);
                $scope.$apply();
            });
        }
    }

    $scope.fieldSet={
        description:'',
        phone:'',
        email:'',
        annex:[]
    }

    $scope.reset = function(){
        $scope.fieldSet={
            description:'',
            phone:'',
            email:'',
            annex:[]
        };
    }

    $scope.submit = function(){
        var params = angular.copy($scope.fieldSet);
        params.annex = angular.toJson(params.annex);
        if($scope.viewState==1){
            params.order_type='topic';
            $http.post(baseUrl.getUrl() + "/api/1/work_order/",params).success(function (data) {
                if (data.code == 200) {
                    $scope.step(0);
                }
            });
        }else if($scope.viewState==2){
            params.order_type='rule';
            $http.post(baseUrl.getUrl() + "/api/1/work_order/",params).success(function (data) {
                if (data.code == 200) {
                    $scope.step(0);
                }
            });
        }
    }

    $scope.getFileName=utils.getFileName;
});
