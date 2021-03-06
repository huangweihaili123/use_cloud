var app = angular.module('RDash');
app.register.controller("strategyCtr", function (ngDialog, $scope, $http, $location, $uibModal, $interval, $cookieStore, baseUrl, $rootScope, utils, PageHandle, $stateParams, $timeout, url_junction) {
    //console.log("主题2222项目管理控制台");
    //console.log('id',$stateParams.projectId)
    //console.log('name',$stateParams.projectName)

    //$scope.projectName = $stateParams.projectName;
    //$scope.projectId = $stateParams.projectId;

    //ngDialog.open({
    //    template: '<p style=\"text-align: center\">添加失败</p>',
    //    plain: true
    //});

    var urlData = $location.search()
    console.log('urlData', urlData)
    $scope.projectName = urlData.projectName;
    $scope.projectId = urlData.projectId;

    console.log('id', $scope.projectId)
    console.log('name', $scope.projectName)

    $scope.$on('to-pare', function (d, data) {
        console.log(data);
        $scope.$broadcast('to-child', {id: $scope.projectId, name: $scope.projectName, tabName: 'strategy'});
    });

    $scope.optip = 'obj-hide'
    $scope.addstrategy = 'obj-hide'
    $scope.optipHide = function () {
        $timeout(function () {
            $scope.optip = 'obj-hide'
        }, 1000)
    }

    $scope.optipShow = function (iFlag, message) {
        baseUrl.bodyScroll()
        if(iFlag == 1){//成功返回
            $scope.$broadcast('optip', {flag: iFlag, msg: message});
            $scope.optip = 'obj-show'
            $scope.optipHide()
        }

    }

    //add
    $scope.addStrategy = function () {
        $scope.addstrategy = 'obj-show'
        $scope.$broadcast('addstrategy', {method: 'add', title: '添加策略', projectId: $scope.projectId, scope: $scope});
    }

    $scope.$on('addstrategyclose', function () {
        $scope.addstrategy = 'obj-hide'
    })

    //modify
    $scope.modifyStrategy = function (idx) {
        $scope.addstrategy = 'obj-show'
        $scope.$broadcast('addstrategy', {
            method: 'modify',
            title: '编辑策略',
            projectId: $scope.projectId,
            scope: $scope,
            data: $scope.query_result[idx]
        });
    }

    $scope.$on('addstrategyclose', function () {
        $scope.addstrategy = 'obj-hide'
    })

    // console.log("<========>"+$location.path());
    $scope.number = "10";
    $scope.maxSize = 5;
    $scope.bigCurrentPage = 1;
    $scope.numbers = [10, 20, 30, 40, 50];
    $scope.bigCurrentPage = 1;
    //$scope.query_result = []
    $scope.strategy_nameTemp = ''
    var BaseUrl = baseUrl.getUrl();

    $scope.setPage = function (pageNo) {
        if (PageHandle.setPageInput($scope.index_sel, $scope.total_page)) {
            $scope.bigCurrentPage = $scope.index_sel;
            $scope.index_sel = "";
            $scope.submit_search();
        } else
            $scope.index_sel = "";
    };

    $scope.submit_search = function () {
        $http.get(BaseUrl + "/api/1/topic/strategy/" + url_junction.getQuery({
                name: $scope.strategy_nameTemp,
                index: $scope.bigCurrentPage,
                number: $scope.number,
                is_page: '1',
                instance: $scope.projectId

            })).success(function (data) {
            if (data.code == 200) {
                $scope.query_result = data.data;
                //$scope.query_result = [{name: 'test', topic: 'test2', description: "test3", id: '123'}]
                $scope.bigTotalItems = data.pageinfo.total_number;
                $scope.total_page = data.pageinfo.total_page;
                $scope.currentPageTotal = $scope.query_result.length;


            } else {
                console.log(data)
            }
        }).error(function (data, state) {
            if (state == 403) {
                //BaseUrl.redirect()
                baseUrl.redirect('没有权限,即将跳转到登录页')
            }
        })

    };
    $scope.submit_search();
    $scope.changePage = function () {
        $scope.submit_search();
    }
    $scope.setShowNum = function (number) {
        $scope.number = number;
        $scope.submit_search();
    }

    $scope.searchBtn = function () {
        $scope.bigCurrentPage = 1;
        $scope.strategy_nameTemp = $scope.strategy_name;
        $scope.submit_search()
    }

    $scope.open = function (size, method, index) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            controller: 'ModalStrategy',
            templateUrl: "myModalstrategy.html",
            size: size,
            resolve: {
                items: function () {
                    if (method == "delete") {
                        return {
                            title: "删除策略",
                            method: "delete",
                            scope: $scope,
                            data: $scope.query_result[index]
                        }
                    }
                }


            }
        });
        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            baseUrl.bodyScroll()
        })


    }


})
