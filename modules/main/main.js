angular.module("RDash", ['ui.bootstrap', 'ui.router', 'ngCookies', 'ngDialog', 'cgBusy',
    'truncate', 'ui.select', 'ngSanitize', 'angular-loading-bar', 'ngAnimate']);
require('router');
require('interceptor');
require('common/service/listService');
require('common/constant');
require('common/service/utils');
require('components/opTip');
require('components/cover');
require('components/addStrategy');
require('components/addRegulation');
require('common/fliter');
require('common/global');


/**
 * Master Controller
 */
var app = angular.module('RDash');


app.config(function ($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

});

app.service("baseUrl", function (constant, ngDialog, $location, $timeout) {
    var url = constant.url;
    return {
        getUrl: function () {
            return url;
        },
        getServerUrl: function () {
            //return 'http://' + $location.host() + ':' + $location.port() + "/";
            if ((typeof $location.port()) === 'number') {
                return 'http://' + $location.host() + ':' + $location.port() + "/";
            } else {
                return 'http://' + $location.host() + "/";
            }
        },
        ngDialog: function (sAlert) {
            ngDialog.open({
                template: '<p style=\"text-align: center\">' + sAlert + '</p>',
                plain: true
            });
        },
        dialog: function (sAlert) {
            $('#dialog').show()
            $('#dialog p').html(sAlert)
        },
        closeDialog: function (sAlert) {
            //$('#dialog').hide()
            $('#dialog').fadeOut()

        },
        dupInObjArr: function (key, objArr) {
            var isDup = 0;
            //key = 'name'
            //var test= [{name:'test',s:'pb'},{name:'test2',s:'pb8'},{name:'test',s:'pb7'}]
            var temp = []

            _.forEach(objArr, function (value) {
                if(value[key]){
                    if (_.find(temp, function (o) {
                            return o == value[key];
                        })) {
                        isDup = 1;
                        return isDup;
                    } else
                        temp.push(value[key])
                }

            });
            console.log(isDup)
            return isDup;

        },
        checkUrl: function(input){
            var str = input;
            //在JavaScript中，正则表达式只能使用"/"开头和结束，不能使用双引号
            var Expression=/http(s)?:////([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
            var objExp=new RegExp(Expression);
            if(str.indexOf("localhost")){
                str = str.replace("localhost","127.0.0.1");
            }
            if(objExp.test(str)==true){
                //alert("你输入的URL有效");
                return true;
            }else{
                //alert('你输入的URL无效');
                return false;
            }


        },
        checkTopic: function(input){ //英文 数字 ＃ ＊ 字数限制10
            input = _.trim(input)
            var res = {err:0,msg:''}
            //if(input && input.length > 10){
            //    res = {err:1,msg:'主题输入最长为10'}
            //}
            if(input && !(/^[a-zA-Z0-9#*/]+$/.test(input))){
                res = {err:1,msg:'主题限输入英文数字#＊/'}
            }
            return res;
        },
        redirect: function(sAlert){
            $('#dialog').show()
            $('#dialog p').html(sAlert)
            $timeout(function(){
                $('#dialog').fadeOut()
                window.location.href = baseUrl.getServerUrl() + '/login.html'
            },1000)
        },
        bodyNoScroll: function(){
            angular.element('body').addClass('height-view')
        },
        bodyScroll: function(){
            angular.element('body').removeClass('height-view')
        }

    }
}).service("url_junction", function () {
    return {
        getQuery: function (dic) {
            var query_url = '';
            for (var i in dic) {
                if (dic[i] && dic[i] != '-1') {
                    if (query_url == "") {
                        query_url += "?" + i + "=" + dic[i]
                    } else {
                        query_url += "&" + i + "=" + dic[i]
                    }
                }
            }
            return query_url
        },
        getDict: function (dic) {
            var ret_dic = {};
            for (var i in dic) {
                if (dic[i] && dic[i] != '-1') {
                    ret_dic[i] = dic[i];
                }
            }
            return ret_dic;
        }
    }
});
app.factory('PageHandle', function (ngDialog) {
    return {
        setPageInput: function (sPageInput, iMaxPage) {
            var isNum = /^\d+$/.test(sPageInput);
            if (!isNum) {
                ngDialog.open({
                    template: '<p style=\"text-align: center\">输入页码不正确</p>',
                    plain: true
                });
                return false;
            } else {
                sPageInput = parseInt(sPageInput);
                if (sPageInput == 0 || sPageInput > iMaxPage) {
                    ngDialog.open({
                        template: '<p style=\"text-align: center\">输入页码不正确</p>',
                        plain: true
                    });
                    return false;
                }

            }
            return true;
        }
    }
});
app.filter("time_format", function () {
    return function (input) {

        if (input != undefined) {
            input = input.replace("T", " ");
        }
        return input;
    }
});
app.filter("pubsub", function () {
    return function (input) {

        if (input == 'pubsub') {
            input = 'sp';
        } else if (input == 'publish') {
            input = 'p';
        } else if (input == 'subscribe') {
            input = 's';
        } else {
            input = '';
        }
        return input;
    }
});

app.filter("booleanToString", function () {
    return function (input) {

        if (input) {
            input = '是';
        } else{
            input = '否';
        }
        return input;
    }
});

app.filter("strategy_topic", function () {
    return function (input) {

        var father = input.father;
        var name = input.name;
        if(father){
            if(name){
                var splitVar = '/';
                if(father.endsWith(splitVar)){
                    splitVar = '';
                }
                name = father+splitVar+name;
            }else{
                name = father;
            }
        }
        return name;
    }
});

app.filter("category_topic", function () {
    return function (input) {
        if(input && input.endsWith('/')){
            input = input.substring(0,input.length-1)
        }
        return input;
    }
});

app.filter("strategyadd_topic", function () {
    return function (input) {
        if(input){
            for(var i=0; i<input.length;i++){
                if(input[i]['delete']){
                    _.pullAt(input, [i]);
                }
            }
        }
        return input;
    }
});

app.factory('HttpInterceptor', ['$q', '$injector', HttpInterceptor]);
function HttpInterceptor($q, $injector) {
    return {
        request: function (config) {
            return config;
        },
        requestError: function (err) {
            return $q.reject(err);
        },
        response: function (res) {
            var ngDialog;
            if (!ngDialog) {
                ngDialog = $injector.get("ngDialog")
            }
            if (res.data.code) {
                if (res.data.code != '200') {
                    ngDialog.open({
                        template: '<p style=\"text-align: center\">错误信息：' + res.data.message + '</p>',
                        plain: true
                    });
                }
                ;

            }
            return res;
        },
        responseError: function (err) {
            var ngDialog;
            if (!ngDialog) {
                ngDialog = $injector.get("ngDialog")
            }
            if (-1 === err.status) {
                // 远程服务器无响应
                 ngDialog.open({
                     template:'<p style=\"text-align: center\">远程服务器无响应</p>',
                     plain:true
                 });
            } else if (500 === err.status) {
                // 处理各类自定义错误
                ngDialog.open({
                    template: '<p style=\"text-align: center\">内部服务器错误</p>',
                    plain: true
                });
            } else if (501 === err.status) {
                // ...
            } else if (403 === err.status) {
                 //window.location.href = "/login.html"
                $('#dialog').show()
                $('#dialog p').html('没有权限,即将跳转到登录页')
                $timeout(function(){
                    $('#dialog').fadeOut()
                    window.location.href = '/login.html'
                },1000)
            }
            return $q.reject(err);
        }
    };
}

// 添加对应的 Interceptors
app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push(HttpInterceptor);
}]);

app.controller("MasterCtrl", function ($scope, $cookieStore, $http, baseUrl, ngDialog, $rootScope, cfpLoadingBar) {

    var baseUrl = baseUrl.getUrl();
    cfpLoadingBar.start();
    cfpLoadingBar.complete();
    $rootScope.alert_pop = function (alert_info) {
        $rootScope.alert_info = alert_info;
        ngDialog.open({
            template: "alert.html",
            //className:'ngDialog-theme-default',
            preCloseCallback: function () {

            }
        })
    }

})


app.controller("headerCtrl", function ($scope, $cookieStore, $http, $uibModal, baseUrl, ngDialog, $rootScope) {

    $scope.state = {
        manage: false,
        register: true,
        login: true,
        user_name: false

    }
    var user_token = sessionStorage.getItem("user_token");
    if (user_token) {
        var username = sessionStorage.getItem("loginName");
        var password = sessionStorage.getItem("password");
        $scope.state.manage = true;
        $scope.username = username;
        $scope.state.register = false;
        $scope.state.login = false;
        $scope.state.user_name = true;

    }

    $scope.quit = function () {
        sessionStorage.removeItem("user_token");
        $scope.state.user_name = false;
        window.location.href = "/index.html";

    };

    $scope.nav_state = {
        first: true,
        second: false,
        third: false,
        fourth: false,
        fifth: false,
        second_detail: false,
        fourth_detail:false,
    }
    $scope.toggle = function (state) {
        for (i in $scope.nav_state) {
            if (i == state) {
                $scope.nav_state[i] = true;
            } else {
                $scope.nav_state[i] = false
            }
        }
    }
    $scope.detail = function(title,state){
        $scope.title = title;
        for (i in $scope.nav_state) {
            if (i == state) {
                $scope.nav_state[i] = true;
            } else {
                $scope.nav_state[i] = false
            }
        }
    }

    //devdoc
    $scope.current_devdoc_btn = '0'
    $scope.devdoc_btn = {
        //0:true,
        //1:false,
        //2:false,
        //3:false,
        //4:false,
        //5:false
        0:{active:true,tab_active:0},
        1:{active:false,tab_active:0},
        2:{active:false,tab_active:0},
        3:{active:false,tab_active:0},
        4:{active:false,tab_active:0},
        5:{active:false,tab_active:0}
    }

    $scope.devdoc_btn_click = function(idx){
        if($scope.current_devdoc_btn != idx){
            for (i in $scope.devdoc_btn) {
                if (i == idx) {
                    $scope.devdoc_btn[i]['active'] = true;
                } else {
                    $scope.devdoc_btn[i]['active'] = false
                }
            }

            $scope.devdoc_tab_click(idx,'0')
            $scope.current_devdoc_btn = idx;
        }
    }

    $scope.devdoc_tab = {
        //0:true,
        //1:false,
        //2:false,
        //3:false,
        //4:false,
        //5:false,
        //6:false

        0:['注册账号','用户资料','如何创建物接入','如何创建物解析','如何创建规则','如何使用时序数据库','查看个人主页'],
        1:['物接入示例','物解析示例','规则创建示例','时序数据库示例'],
        2:['RFID射频卡','RFID接收器','网络摄像头','智能地磅','自定义硬件'],
        3:['直播控制客户端','盒子客户端'],
        4:['物接入API','物管理API'],
        5:['物接入SDK','物管理SDK']
    }

    $scope.devdoc_tab_click = function(fathterIdx,idx){
        //for (i in $scope.devdoc_tab) {
        //    if (i == idx) {
        //        $scope.devdoc_tab[$scope.current_devdoc_btn][i] = true;
        //    } else {
        //        $scope.devdoc_tab[i] = false
        //    }
        //}
        console.log(fathterIdx)
        $scope.devdoc_btn[fathterIdx]['tab_active'] = idx;

    }

})


app.controller('headerManageCtrl', function ($scope, $cookieStore, $http, $uibModal, baseUrl, ngDialog, $rootScope) {


    $scope.open = function (size, method) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            controller: 'ModalHeader',
            templateUrl: "myModalContent.html",
            size: size,
            resolve: {
                items: function () {
                    if (method == "quit") {
                        return {
                            title: "退出IOT云",
                            method: "quit",
                            scope: $scope
                        }
                    }
                }
            }
        });
        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
        });
    }
   var BaseUrl=baseUrl.getUrl();
    $scope.orderCount="";
    $http.get(BaseUrl+"/api/1/work_order/?is_page=1&&state=feedback").success(function(data){
        if(data.code==200){
            $scope.orderCount=data.pageinfo.total_number;
        }

    })
    // var username = sessionStorage.getItem("loginName");
    // if (username) {
    //     $scope.user_name = username;
    // }
    // ;
    $http.get(BaseUrl+"/api/1/user/login").success(function(data){
        if(data.code==200){
            $scope.user_name=data.data.username;
        }
    })
    $scope.go=function(){
        window.location.href="#/myOrder";
    }

})

app.controller('ModalHeader', function ($scope, $cookieStore, $uibModalInstance, $http, items, baseUrl, url_junction, ngDialog) {
    baseUrl = baseUrl.getUrl();
    $scope.item = items;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    if ($scope.item.method == 'quit') {
        $scope.ok = function () {
            $http.get(baseUrl + "/api/1/user/logout").success(function (data) {
                if (data.code == "200") {
                    sessionStorage.removeItem("user_token");
                    window.location.href = "/index.html"
                }
            }).error(function () {
                ngDialog.open({
                    template: '<p style=\"text-align: center\">退出出错:' + data.description + '</p>',
                    plain: true
                });
            });
            $uibModalInstance.close();
        }
    }


})


app.controller("sideBarCtrl", function ($scope, $cookieStore, $http, $uibModal, $location, baseUrl, ngDialog, $rootScope,constant) {
    console.log("<=====管理控制台首页sidebar=====>")
    console.log("<==地址===>" + $location.path());

    if ($location.path() == "") {
        console.log("<====地址为空===>");
    }
    $scope.status = {
        "subject": false,
        "object": false,
        'work_order': false
    }
    $scope.toggle = function (name) {
        if (name) {
            $scope.status[name] = !$scope.status[name];
        }

    }
    var BaseUrl=baseUrl.getUrl();
    $scope.emailCount=0;
   
    $scope.get_emailCount=function(){
        $http.get(BaseUrl+"/api/1/message/count/?status=0").success(function(data){
            if(data.code==200){
                $scope.emailCount=data.data;
            }
        })
    }
    $scope.get_emailCount();
    // var username = sessionStorage.getItem("loginName");
    // if (username) {
    //     $scope.user_name = username;
    // }
    $http.get(BaseUrl+"/api/1/user/login").success(function(data){
        if(data.code==200){
            $scope.user_name=data.data.username;
        }
    })
})


app.controller('ModalProject', function ($scope, $cookieStore, $uibModalInstance, $http, items, baseUrl, url_junction, ngDialog) {
    baseUrl.bodyNoScroll()
    var baseUrlTemp = baseUrl
    baseUrl = baseUrl.getUrl();
    $scope.item = items;
    $scope.cancel = function () {
        baseUrlTemp.bodyScroll()
        $uibModalInstance.dismiss('cancel');
    };
    $scope.state = {
        add: false,
        delete: false
    }
    // console.log("<==项目名称====>"+$scope.project_name);
    if ($scope.item.method == 'add') {
        $scope.state.add = true;
        $scope.state.delete = false;
        $scope.ok = function () {
            $scope.params = {
                name: $scope.project_name
            }
            // console.log("<==项目名称====>"+$scope.project_name);
            $http.post(baseUrl + "/api/1/topic/instance/", $scope.params).success(function (data) {
                if (data.code == "200") {
                    items.scope.submit_search();
                }
            }).error(function () {
                ngDialog.open({
                    template: '<p style=\"text-align: center\">添加失败:' + data.description + '</p>',
                    plain: true
                });
            });
            $uibModalInstance.close();
        }
    }


    if($scope.item.method=='delete'){
        $scope.state.add=false;
        $scope.state.delete=true;
        $scope.ok=function(){
            $scope.pk=items.id;
            $http.delete(baseUrl+"/api/1/topic/instance/"+$scope.pk+"/").success(function(data){
                if(data.code=="200"){

                    items.scope.submit_search();
                }
            }).error(function () {
                alert("有点故障！")
            });
            $uibModalInstance.close();
        }


    }


})

app.controller('projectTabCtr', function ($scope, $cookieStore, $http, baseUrl, url_junction, ngDialog, $location) {
    //baseUrl = baseUrl.getUrl();
    //$scope.item = items;
    //console.log(10)
    $scope.item = {
        id: '',
        name: '',
        category: false,
        identity: false,
        strategy: false
    }
    $scope.$on('to-child', function (d, data) {

        console.log("projectId", data);
        $scope.item.id = data.id;
        $scope.item.name = data.name;
        $scope.item[data.tabName] = true;

        console.log($scope.item.category);

    });

    $scope.$emit('to-pare', 'ok');

    $scope.go = function (tab) {
        $location.path('/' + tab).search({projectId: $scope.item.id, projectName: $scope.item.name});
    }


})

app.controller('opTipCtr', function ($scope, $cookieStore, $http, baseUrl, url_junction, ngDialog) {

    $scope.$on('optip', function (d, data) {

        $scope.flag = data.flag;
        $scope.optipText = data.msg;

    });
})


app.controller('coverCtr', function ($scope, $cookieStore, $http, baseUrl, url_junction, ngDialog) {
  var   BaseUrl = baseUrl.getUrl();

    $scope.item = {};
    $scope.numbers = [10, 20, 30, 40, 50];
    $scope.state={
        pointer:false,
        strategy:false,
        secret:false,
        undelete:false,
        delete:false

    };
    $scope.params={};
    var instance="";
    var select_topicTemp="";
    var select_topicTemp_res=""
    $scope.$on("identityState",function(event,data){
        baseUrl.bodyNoScroll()
        console.log(data);
        instance=data.projectId;
        $http.get(BaseUrl + "/api/1/topic/instance/?pk="+instance).success(function(data){
            if(data.code==200){
                select_topicTemp=data.data[0].topic;
                select_topicTemp_res=data.data[0].topic;
                $scope.subtite_desc=select_topicTemp;
                // console.log("<===获取项目详情=>")
                // console.log(data);
            }


        })

        if(data.method=='add'||data.method=='edit'){
            $scope.state.undelete=true;
            $scope.state.delete=false;
            $scope.params={
                identity_name:"",
                strategyId:"",
                description:""

            }

          //下拉框
            $scope.strategy_list=[];
            $scope.params.strategyId=-1;
            $scope.class_list=[];
            $scope.params.classId=-1;

            $scope.get_strategyList=function(){
                $http.get(BaseUrl + "/api/1/topic/strategy/?instance="+instance).success(function (data) {
                    if (data.code == 200) {
                        $scope.strategy_list = data.data;
                        $scope.strategy_list.push({id: '-1', name: '-------------'});
                    }
                })
            }
          $scope.get_classList=function(){
              $http.get(BaseUrl + "/api/1/topic/class/?instance="+instance).success(function (data) {
                  if (data.code == 200) {
                      $scope.class_list = data.data;
                      $scope.class_list.push({id: '-1', name: '-------------'});
                  }
              })
          }


            $scope.get_strategyList();
            $scope.get_classList();

            //选择策略
            $scope.select_strategy=function(strategyId){
                $scope.params.strategyId=strategyId;
                console.log("<===策略ID===>"+strategyId);
            }
            //选择实例
            $scope.select_class=function(classId){
                $scope.params.classId=classId;

                console.log("<===实例ID===>"+classId);
                if(classId!=-1){
                  $http.get(BaseUrl + "/api/1/topic/class/"+classId+"/").success(function(data){
                    select_topicTemp=data.data.complete_topic;
                    $scope.subtite_desc=select_topicTemp;
                  })
                }else{
                    $scope.subtite_desc=select_topicTemp_res;
                }

            }


           //添加项目操作
            if(data.method=='add'){

                //保存
                $scope.ok=function(){
                    var query_url = url_junction.getDict({
                        name:$scope.params.identity_name,
                        instance:instance ,
                        strategy:$scope.params.strategyId,
                        description:$scope.params.description,

                    });
                    $http.post(BaseUrl+"/api/1/topic/identity/",query_url).success(function(data){
                        if(data.code==200){
                            $scope.item.scope.submit_search();
                            $scope.item.scope.optipShow(1, '操作成功')
                            $scope.cancel();
                        };
                    }).error(function(){
                        alert("error")
                    });

                }

            }
                $scope.ok_strategy=function(){
                    var query_url={
                        name:$scope.params.strategy_name,
                        classification:$scope.params.classId,
                        description:$scope.params.strategy_desc,
                        instance:instance,
                        topic:[]

                    }

                        _.forEach($scope.addTopicList, function (value) {

                            var pubsub = value['pubsub'];
                            if (/ps/.test(pubsub)) {
                                pubsub = 'pubsub'
                            }else if (/sp/.test(pubsub)) {
                                pubsub = 'pubsub'
                            } else if (/p/.test(pubsub)) {
                                pubsub = 'publish'
                            } else if (/s/.test(pubsub)) {
                                pubsub = 'subscribe'
                            }

                            query_url.topic.push({name: value['name'], pubsub: pubsub})

                        });

                    query_url.topic = JSON.stringify(query_url.topic);
                    var pubsub_validate="";
                    var pubsub_validate_flag="";
                    var pubsub_validate_same="";
                    var temp=[];
                    $scope.get_validate_same=function(){
                        _.forEach($scope.addTopicList, function (value) {
                          if(temp.indexOf(value.name) == -1){
                              temp.push(value.name);
                              pubsub_validate_same=true;
                          }else{
                              pubsub_validate_same=false;
                              return false
                          }

                        });
                        return pubsub_validate_same;
                    }


                   $scope.get_validate=function(){
                       _.forEach($scope.addTopicList, function (value) {
                           if(value.pubsub==""){
                               pubsub_validate="请选择权限";
                               pubsub_validate_flag=false;
                               return false;
                           }else{
                               pubsub_validate_flag=true;
                               return true
                           }

                       });
                       return pubsub_validate_flag;
                   }

                    if($scope.get_validate()&& $scope.get_validate_same()){
                        $http.post(BaseUrl + "/api/1/topic/strategy/", query_url).success(function (data) {
                            if (data.code == "200") {
                                $scope.params.strategyId=data.data.id;
                                $scope.get_strategyList();
                                $scope.item.scope.optipShow(1, '操作成功')
                                $scope.cancel_strategy();

                            }
                        })
                    }else{
                        if(!$scope.get_validate()){
                            baseUrl.ngDialog("请选择权限");
                        }
                        if(!$scope.get_validate_same()){
                            baseUrl.ngDialog("主题名称请不要相同");
                        }

                    }





                }



            if(data.method=="edit"){
                $scope.identity_id=data.item.id;
                $scope.params.identity_name=data.item.name;
                $scope.params.strategyId=data.item.strategy.id;
                $scope.params.description=data.item.description;
                var temp_secret=data.item.secret_key;
                $scope.edit={
                    showBtn:true,
                    hideBtn:false,
                    resetBtn:true
                }

                // $scope.show_reset=true;
                $scope.show_secrect=function(){
                    $scope.params.secret_key=temp_secret;
                    $scope.edit.showBtn=false;
                    $scope.edit.hideBtn=true;
                }
                $scope.hide_secrect=function(){
                    $scope.edit.showBtn=true;
                    $scope.edit.hideBtn=false;
                    $scope.params.secret_key="";

                }
                $scope.reset_secrect=function(id){
                    $http.put(BaseUrl+"/api/1/topic/identity/reset/"+id+"/").success(function(data){
                            if(data.code==200){
                                if($scope.edit.hideBtn){
                                    $scope.params.secret_key=data.data.secret_key;
                                    // $scope.show_reset=false;
                                    temp_secret=data.data.secret_key;
                                }

                            }
                    })

                }
                $scope.ok=function(){
                    var query_url_edit = url_junction.getDict({
                        name:$scope.params.identity_name,
                        strategy:$scope.params.strategyId,
                        description:$scope.params.description,

                    });
                    $http.put(BaseUrl+"/api/1/topic/identity/"+$scope.identity_id+"/",query_url_edit).success(function(data){
                         if(data.code==200){
                             $scope.item.scope.submit_search();
                             $scope.item.scope.optipShow(1, '操作成功')
                             $scope.cancel();
                         }
                    })
                }

                console.log($scope.params);
            }





        }
        if(data.method=="delete"){
            $scope.state.delete=true;
            $scope.state.undelete=false;
            $scope.identity_id=data.item.id;

        }

        if(data.method=="edit"){
            $scope.state.secret=true;




        }else{
            $scope.state.secret=false;
        }
        $scope.item = data;
    })



    //删除
    $scope.delete=function(id){
        $http.delete(BaseUrl+"/api/1/topic/identity/"+id+"/").success(function(data){
            if(data.code=="200"){
                $scope.item.scope.submit_search();
                $scope.item.scope.optipShow(1, '操作成功')
                $scope.cancel();
            }

        }).error(function(){
            alert("有点故障！")
        });


    }
    $scope.cancel = function(){
        baseUrl.bodyScroll()
        $scope.$emit('addidentityclose','close')
    };

    // $scope.point_add_strategy=function(){
    //    $scope.params.strategy_name="123444555";
    // }

    //选择添加策略
    $scope.selectAdd = function () {
        $scope.state.pointer = true;
        $scope.state.strategy = true;
        $(".identity_warp").width(1010)
        // $scope.point_add_strategy();
        $scope.addTopicList=[];
        $scope.addTopicList.push({p: false, s: false, name: '', pubsub: ''});
        $scope.remainTopicToAddCount = 4;

    }


   $scope.cancel_strategy=function(){
       $scope.state.pointer=false;
       $scope.state.strategy=false;
       $(".identity_warp").width(480)
   }



    $scope.addTopicList = [{p:false,s:false,pubsub:'',name:''}]; //{p:false,s:false}
    $scope.remainTopicToAddCount = 4;
    $scope.addTopicFunc = function () {
        $scope.remainTopicToAddCount--;
        $scope.addTopicList.push({p: false, s: false, name: '', pubsub: ''})
        console.log($scope.addTopicList)
    }
    $scope.delTopicFunc = function (idx) {
        $scope.remainTopicToAddCount++;
        _.pullAt($scope.addTopicList, [idx]);
    }
    $scope.addPS = function (idx, type) {
        $scope.addTopicList[idx][type] = !$scope.addTopicList[idx][type];
        var reg = new RegExp(type)
        if (reg.test($scope.addTopicList[idx]['pubsub'])) {
            $scope.addTopicList[idx]['pubsub'] = $scope.addTopicList[idx]['pubsub'].replace(type, '')
        } else {
            $scope.addTopicList[idx]['pubsub'] += type
        }

        console.log($scope.addTopicList[idx]['pubsub'])
    }

})


app.controller('ModalCategory', function ($scope, $cookieStore, $uibModalInstance, $http, items, baseUrl, url_junction, ngDialog,$interval) {
    baseUrl.bodyNoScroll()
    var url = baseUrl.getUrl();
    $scope.item = items;
    $scope.cancel = function () {
        baseUrl.bodyScroll()
        $uibModalInstance.dismiss('cancel');
    };
    var getProjectInfo = function(sProjectId){
        $http.get(url + "/api/1/topic/instance/"+sProjectId+"/").success(function (data) {
            if (data.code == 200) {
                $scope.subtite_desc = data.data.topic;
            } else {
                console.log(data)
            }
        }).error(function (data, state) {

        })
    }
    if ($scope.item.method == 'add') {
        getProjectInfo(items.scope.projectId)
        $scope.ok = function () {
            var isValid = true;
            if (!$scope.name) {
                isValid = false;
                baseUrl.ngDialog('请填写类别名称')
            }
            if (isValid && !$scope.topic) {
                isValid = false;
                baseUrl.ngDialog('请填写主题')
            }
            if(isValid){
                var checkTopicRes = baseUrl.checkTopic($scope.topic);
                if(checkTopicRes.err == 1){
                    isValid = false;
                    baseUrl.ngDialog(checkTopicRes.msg)
                }
            }
            if (isValid) {
                $scope.params = {
                    name: $scope.name,
                    topic: $scope.topic,
                    description: $scope.description,
                    instance: items.scope.projectId
                }
                $http.post(url + "/api/1/topic/class/", $scope.params).success(function (data) {
                    if (data.code == "200") {
                        items.scope.optipShow(1, '操作成功')
                        items.scope.submit_search();
                    }
                }).error(function () {
                    //ngDialog.open({
                    //    template: '<p style=\"text-align: center\">添加失败:'+data.description+'</p>',
                    //    plain: true
                    //});
                    //items.scope.optipShow(0, '操作失败,' + data.description)
                });
                $uibModalInstance.close();

            }
        }
    } else if ($scope.item.method == 'modify') {
        var data = items.data;
        console.log('data', data)
        $scope.name = data.name;
        var cateName = $scope.name;
        //var stop = $interval(function(){
        //    if($scope.subtite_desc){
        //        $scope.topic = $scope.subtite_desc + data.topic;
        //        //$scope.topic = data.topic;
        //        $scope.stopCount()
        //    }
        //}, 100);
        //
        //stop.then(function(){
        //    console.log('complete')
        //}, function(err) {
        //    console.log('Uh oh, error!', err);
        //});
        //
        //$scope.stopCount = function(){
        //    $interval.cancel(stop);
        //}
        $scope.topic = data.complete_topic;
        $scope.description = data.description;

        $scope.ok = function () {
            var isValid = true;
            if (!$scope.name) {
                isValid = false;
                baseUrl.ngDialog('请填写类别名称')
            }
            if(isValid){
                var checkTopicRes = baseUrl.checkTopic($scope.topic);
                if(checkTopicRes.err == 1){
                    isValid = false;
                    baseUrl.ngDialog(checkTopicRes.msg)
                }
            }
            if (isValid) {
                $scope.params = {
                    name: $scope.name,
                    //topic: $scope.topic,
                    description: $scope.description
                }

                if (cateName == $scope.name) {
                    cateName = '';
                    delete $scope.params.name;
                }
                $http.put(url + "/api/1/topic/class/" + data.id + "/", $scope.params).success(function (data) {
                    if (data.code == "200") {
                        items.scope.optipShow(1, '操作成功')
                        items.scope.submit_search();
                    }
                }).error(function () {
                    //ngDialog.open({
                    //    template: '<p style=\"text-align: center\">添加失败:'+data.description+'</p>',
                    //    plain: true
                    //});
                    //items.scope.optipShow(0, '操作失败,' + data.description)
                });
                $uibModalInstance.close();
            }//end ok
        }

    } else if ($scope.item.method == 'delete') {
        $scope.ok = function () {
            var data = items.data;
            $http.delete(url + "/api/1/topic/class/" + data.id + "/", {}).success(function (data) {
                if (data.code == "200") {
                    items.scope.optipShow(1, '操作成功')
                    items.scope.submit_search();
                }
            }).error(function () {
                //ngDialog.open({
                //    template: '<p style=\"text-align: center\">添加失败:'+data.description+'</p>',
                //    plain: true
                //});
                //items.scope.optipShow(0, '操作失败,' + data.description)
            });
            $uibModalInstance.close();

        }
    }


})

app.controller('ModalStrategy', function ($scope, $cookieStore, $uibModalInstance, $http, items, baseUrl, url_junction, ngDialog) {
    baseUrl.bodyNoScroll()
    var url = baseUrl.getUrl();
    $scope.item = items;
    $scope.cancel = function () {
        baseUrl.bodyScroll()
        $uibModalInstance.dismiss('cancel');
    };
    if ($scope.item.method == 'delete') {
        var data = items.data;
        $scope.ok = function () {
            $http.delete(url + "/api/1/topic/strategy/" + data.id + "/", {}).success(function (data) {
                if (data.code == "200") {
                    items.scope.optipShow(1, '操作成功')
                    items.scope.submit_search();
                }
            }).error(function () {
                items.scope.optipShow(0, '操作失败,' + data.description)
            });
            $uibModalInstance.close();
        }
    }


})

app.controller('addStrategyCtr', function ($scope, $cookieStore, $http, baseUrl, url_junction, ngDialog, $timeout) {
    var url = baseUrl.getUrl();

    $scope.numbers = [];
    $scope.item = {};
    $scope.classification = {}
    $scope.classificationTemp = ''
    $scope.topicsOrig = []//pk name pubsub
    $scope.projectNameTemp = ''
    $scope.cancel = function () {
        baseUrl.bodyScroll()
        $scope.$emit('addstrategyclose', 'close')
    };

    var getCategoryList = function(sProjectId,sSelProjectId){
        $scope.numbers = [];
        $http.get(url + "/api/1/topic/class/" + url_junction.getQuery({
                name: '',
                instance: sProjectId,
                index: 1,
                number: 10,
                is_page: '0'

            })).success(function (data) {
            if (data.code == 200) {
                $scope.categoryList = data.data;
                if(!sSelProjectId){
                    $scope.classification = {}
                    //$scope.classification.name = null;
                    $scope.classificationTemp = ''
                }

                _.forEach($scope.categoryList, function(value) {

                    $scope.numbers.push({name:value.name,id:value.id,topic:value.topic})
                    if(sSelProjectId && sSelProjectId == value.id){
                        //$scope.subtite_desc = value.instance.topic+value.topic;
                        $scope.subtite_desc = value.complete_topic;
                        if(!$scope.subtite_desc.endsWith('/')){
                            $scope.subtite_desc += '/';
                        }
                        $scope.subtite_desc_pro = $scope.subtite_desc
                        $scope.classification.name = {name:value.name,id:value.id,topic:value.topic}
                        $scope.classificationTemp = value.id
                    }
                });

            } else {
                console.log(data)
            }
        }).error(function (data, state) {
            if (state == 403) {
                BaseUrl.redirect()
            }
        })

        $scope.numbers.push({name:'---------',id:'',topic:''})

    }

    $scope.setShowNum = function(category){
        $scope.classificationTemp = category.id;
        $scope.subtite_desc = $scope.subtite_desc_pro+category.topic;
    }
    $scope.subtite_desc_pro = ''
    var getProjectInfo = function(sProjectId,oCateData){
        if(oCateData && oCateData.classification){

        }else{
            $http.get(url + "/api/1/topic/instance/"+sProjectId+"/").success(function (data) {
                if (data.code == 200) {
                    $scope.subtite_desc = data.data.topic;
                    $scope.subtite_desc_pro = $scope.subtite_desc
                } else {
                    console.log(data)
                }
            }).error(function (data, state) {

            })
        }

    }

    $scope.$on('addstrategy', function (q, data) {
        baseUrl.bodyNoScroll()
        $scope.item = data;
        var isValid = true;
        var invalidMsg = ''
        var nameTemp = ''
        var init = function () {
            $scope.addTopicList = []; //{p:false,s:false,name:'',pubsub:''}
            $scope.remainTopicToAddCount = 5;
            $scope.addstrategy_content_topzero = "";
            if($scope.item.data) {
                $scope.topicsOrig = $scope.item.data.topics;
                getCategoryList(data.projectId,$scope.item.data.classification)
            }
            else{
                getCategoryList(data.projectId,'')
            }

            getProjectInfo(data.projectId,$scope.item.data)
        }
        if ($scope.item.method == 'add') {
            init()
            $scope.name = '';
            //$scope.classification = {};
            //$scope.topic = data.topic;
            $scope.description = '';
            $scope.addTopicFunc(1)//策略必须得有一个主题 1表示existone为1

            $timeout(function () {
                if (angular.element('#addstrategy-content').height() >= angular.element(window).height()) {
                    //$scope.addstrategy_content_topzero = "addstrategy-content-topzero"
                }
            }, 100)

        } else if ($scope.item.method == 'modify') {
            init()
            var data = $scope.item.data;
            $scope.name = data.name;
            nameTemp = $scope.name;
            //$scope.classificationTemp = data.classification;
            //$scope.topic = data.topic;
            $scope.description = data.description;
            $scope.remainTopicToAddCount = $scope.remainTopicToAddCount - data.topics.length;
            //var stop = $interval(function(){
            //    if($scope.subtite_desc){
            //        $scope.topic = $scope.subtite_desc + data.topic;
            //        $scope.stopCount()
            //    }
            //}, 100);
            //
            //stop.then(function(){
            //    console.log('complete')
            //}, function(err) {
            //    console.log('Uh oh, error!', err);
            //});
            //
            //$scope.stopCount = function(){
            //    $interval.cancel(stop);
            //}
            _.forEach(data.topics, function (value) {
                var topicItem = {pk:-1, p: false, s: false, pubsub: '', name: ''}
                if (value['pubsub']) {
                    var pubsub = value['pubsub'];
                    if (/pubsub/.test(pubsub)) {
                        pubsub = 'ps'
                        topicItem['p'] = true;
                        topicItem['s'] = true;
                    } else if (/publish/.test(pubsub)) {
                        pubsub = 'p'
                        topicItem['p'] = true;
                    } else if (/subscribe/.test(pubsub)) {
                        pubsub = 's'
                        topicItem['s'] = true;
                    }

                    topicItem['pubsub'] = pubsub;
                }

                topicItem['name'] = value['name'];
                topicItem['pk'] = value['id'];
                $scope.addTopicList.push(topicItem)
            });

            $timeout(function () {
                if (angular.element('#addstrategy-content').height() >= angular.element(window).height()) {
                    //$scope.addstrategy_content_topzero = "addstrategy-content-topzero"
                }
            }, 100)

        }
        if ($scope.item.method == 'add' || $scope.item.method == 'modify') {
            $scope.ok = function () {
                isValid = true;
                invalidMsg = ''
                $scope.params = {
                    name: $scope.name,
                    //classification:$scope.classification,
                    //classification:'23',
                    classification: $scope.classificationTemp,
                    description: $scope.description,
                    instance: $scope.item.projectId,
                    topic: []
                };
                if ($scope.name == '' || $scope.name == null || typeof($scope.name) == 'undefined') {
                    isValid = false;
                    invalidMsg = '策略名称不能为空'
                }
                else if ($scope.item.method == 'modify' && nameTemp == $scope.name) {
                    delete $scope.params.name;
                }
                var topicEmpty = function () {
                    var isTopicInvalid = true;
                    _.forEach($scope.addTopicList, function (value) {
                        console.log('value', value['name'])
                        if (isTopicInvalid && !value['delete'] && !value['name']) {
                            isValid = false;
                            invalidMsg = '主题不能为空'
                            isTopicInvalid = false
                        }
                        if(isTopicInvalid && value['name']){
                            var checkTopicRes = baseUrl.checkTopic(value['name']);
                            if(checkTopicRes.err == 1){
                                isValid = false;
                                invalidMsg = checkTopicRes.msg
                                isTopicInvalid = false
                            }
                        }
                    });
                }

                var topicRightTell = function () {
                    var isTopicInvalid = true;
                    _.forEach($scope.addTopicList, function (value) {
                        console.log('value', value['pubsub'])
                        if (isTopicInvalid && !value['delete'] && !value['pubsub']) {
                            isValid = false;
                            //invalidMsg = '主题权限必选'
                            invalidMsg = '请选择权限'
                            isTopicInvalid = false
                        }
                    });
                }

                //if (isValid) {
                //    topicEmpty()
                //}

                if (isValid && baseUrl.dupInObjArr('name', $scope.addTopicList)) {
                    isValid = false;
                    //invalidMsg = '主题不能重复'
                    invalidMsg = '主题名称不能相同'
                }

                if (isValid) {
                    topicRightTell()
                }

                if (!isValid) {
                    baseUrl.ngDialog(invalidMsg)
                }

                if (isValid) {
                    _.forEach($scope.addTopicList, function (value) {
                        var pubsub = value['pubsub'];
                        if (/ps/.test(pubsub)) {
                            pubsub = 'pubsub'
                        } else if (/sp/.test(pubsub)) {
                            pubsub = 'pubsub'
                        } else if (/p/.test(pubsub)) {
                            pubsub = 'publish'
                        } else if (/s/.test(pubsub)) {
                            pubsub = 'subscribe'
                        }
                        //topicsOrig
                        if(!value['delete']){
                            if($scope.item.method == 'add'){
                                $scope.params.topic.push({name: value['name'], pubsub: pubsub})
                            }else{
                                $scope.params.topic.push({pk:value['pk'],name: value['name'], pubsub: pubsub})
                            }
                        }else{
                            $scope.params.topic.push({pk:value['pk'],delete: 1})
                        }


                    });
                    $scope.params.topic = JSON.stringify($scope.params.topic);
                    if ($scope.item.method == 'add') {
                        $http.post(url + "/api/1/topic/strategy/", $scope.params).success(function (data) {
                            if (data.code == "200") {
                                $scope.item.scope.optipShow(1, '操作成功')
                                $scope.item.scope.submit_search();
                            }
                        }).error(function () {
                            //ngDialog.open({
                            //    template: '<p style=\"text-align: center\">添加失败:'+data.description+'</p>',
                            //    plain: true
                            //});
                            //$scope.item.scope.optipShow(0, '操作失败,' + data.description)
                        });
                    }//end if
                    else {
                        $http.put(url + "/api/1/topic/strategy/" + $scope.item.data.id + "/", $scope.params).success(function (data) {
                            if (data.code == "200") {
                                $scope.item.scope.optipShow(1, '操作成功')
                                $scope.item.scope.submit_search();
                            }
                        }).error(function () {
                            //ngDialog.open({
                            //    template: '<p style=\"text-align: center\">添加失败:'+data.description+'</p>',
                            //    plain: true
                            //});
                            //$scope.item.scope.optipShow(0, '操作失败,' + data.description)
                        });
                    }

                    //$uibModalInstance.close();
                    $scope.$emit('addstrategyclose', 'close')
                }

            }
        }//end if
    })

    $scope.addTopicList = []; //{p:false,s:false,name:'',pubsub:''}
    $scope.remainTopicToAddCount = 5;
    $scope.addstrategy_content_topzero = "";
    $scope.addPS = function (idx, type) {
        $scope.addTopicList[idx][type] = !$scope.addTopicList[idx][type];
        var reg = new RegExp(type)
        if (reg.test($scope.addTopicList[idx]['pubsub'])) {
            $scope.addTopicList[idx]['pubsub'] = $scope.addTopicList[idx]['pubsub'].replace(type, '')
        } else {
            $scope.addTopicList[idx]['pubsub'] += type
        }
    }
    $scope.addTopicFunc = function (existone) {
        $scope.remainTopicToAddCount--;
        if($scope.item.method == 'add'){
            $scope.addTopicList.push({p: false, s: false, name: '', pubsub: ''})
        }else{
            $scope.addTopicList.push({pk:-1, p: false, s: false, name: '', pubsub: ''})
        }

        $timeout(function () {
            if (angular.element('#addstrategy-content').height() >= angular.element(window).height()) {
                //$scope.addstrategy_content_topzero = "addstrategy-content-topzero"
            }
        }, 100)

    }
    $scope.delTopicFunc = function (idx) {
        $scope.remainTopicToAddCount++;
        //_.pullAt($scope.addTopicList, [idx]);
        var deleteTopicId = $scope.addTopicList[idx]['pk'];
        _.pullAt($scope.addTopicList, [idx]);
        if($scope.item.method == 'modify'){
            $scope.addTopicList.push({'pk':deleteTopicId,'delete':1})
        }
        $timeout(function () {
            if (angular.element('#addstrategy-content').height() < angular.element(window).height()) {
                //$scope.addstrategy_content_topzero = ""
            }
        }, 100)
    }
    $scope.setModel = function (idx) {
        return 'topic' + idx;
    }


})

app.controller('ModalRegulation', function ($scope, $cookieStore, $uibModalInstance, $http, items, baseUrl, url_junction, ngDialog) {
    baseUrl.bodyNoScroll()
    var url = baseUrl.getUrl();
    $scope.item = items;
    $scope.cancel = function () {
        baseUrl.bodyScroll()
        $uibModalInstance.dismiss('cancel');
    };
    if ($scope.item.method == 'delete') {
        var data = items.data;
        console.log('data', data)
        $scope.ok = function () {
            $http.delete(url + "/api/1/rule/" + data.id + "/", {}).success(function (data) {
                if (data.code == "200") {
                    items.scope.optipShow(1, '操作成功')
                    items.scope.submit_search();
                }
            }).error(function () {
                items.scope.optipShow(0, '操作失败,' + data.description)
            });
            $uibModalInstance.close();
        }
    }


})

app.controller('addRegulationCtr', function ($scope, $cookieStore, $http, baseUrl, url_junction, ngDialog, $timeout) {
    var url = baseUrl.getUrl();
    $scope.username = sessionStorage.getItem('loginName');
    $scope.numbers = [];
    $scope.rule_typeArr = [{"id":'RabbitMQ',"name":'RabbitMQ'},{"id":'API',"name":'API'}];
    $scope.methodArr = [{id:'GET',name:'GET'},{id:'POST',name:'POST'},{id:'PUT',name:'PUT'},{id:'DELETE',name:'DELETE'},{id:'OPTION',name:'OPTION'}];
    $scope.item = {};
    $scope.instance = {}
    //$scope.instance = -1
    $scope.instanceTemp = ''
    $scope.instanceTempName = ''
    $scope.subtite_desc = ''
    //$scope.modifyInDetail = 0
    $scope.cancel = function () {
        baseUrl.bodyScroll()
        //$scope.instance = {}
        $scope.$emit('addstrategyclose', 'close')
    };

    var getProjectInfo = function(sProjectId){
        $http.get(url + "/api/1/topic/instance/"+sProjectId+"/").success(function (data) {
            if (data.code == 200) {
                $scope.subtite_desc = data.data.topic;
                //console.log('subtite_desc',$scope.subtite_desc)
            } else {
                console.log(data)
            }
        }).error(function (data, state) {

        })
    }

    var getProjectList = function(sSelProjectId){
        //sSelProjectId = sSelProjectId.id;
        $scope.numbers = [];
        $http.get(url + "/api/1/topic/instance/" + url_junction.getQuery({
                index: 1,
                number: 10,
                is_page: '0'

            })).success(function (data) {
            if (data.code == 200) {
                $scope.projectList = data.data;
                _.forEach($scope.projectList, function(value) {
                    $scope.numbers.push({name:value.name,id:value.id})
                    if(sSelProjectId && sSelProjectId == value.id){
                        //$scope.instance = {'name':value.name,'id':value.id}
                        //$scope.instance = $scope.numbers[$scope.numbers.length-1]
                       $scope.instance.name = {'name':value.name,'id':value.id}
                        //$scope.instance = value.id
                        $scope.instanceTemp = value.id
                        $scope.instanceTempName = value.name
                    }
                });

            } else {
                console.log(data)
            }
        }).error(function (data, state) {
            if (state == 403) {
                BaseUrl.redirect()
            }
        })

        $scope.numbers.push({name:'---------',id:''})
        //$scope.numbers.push('---------')

        if(!sSelProjectId){
           $scope.instance = {}
            //$scope.instance = -1
            $scope.instanceTemp = ''
            $scope.instanceTempName = ''
        }
    }

    $scope.setShowNum = function(instance){
        //console.log(category.name+','+category.id)
        $scope.instanceSel = true;
        $scope.instanceTemp = instance.id;
        $scope.instanceTempName = instance.name;
        getProjectInfo(instance.id)

        //$scope.instanceTemp = instance;
        //for(var i=0;i<$scope.numbers.length;i++){
        //    if($scope.numbers[i].id == instance){
        //        $scope.instanceTempName = $scope.numbers[i].name;
        //        break;
        //    }
        //}

    }

    $scope.$on('addstrategy', function (q, data) {
        baseUrl.bodyNoScroll()
        $scope.item = data;
        var isValid = true;
        var invalidMsg = ''
        var nameTemp = ''
        $scope.regulationShow = ''
        function instanceTopicChang(){
            var instanceTemp2 = $scope.instanceTempName
            if(instanceTemp2){
                instanceTemp2 = '.'+instanceTemp2
            }
            var topicNameTemp = $scope.topicName
            if(topicNameTemp){
                topicNameTemp = '.'+topicNameTemp
            }
            return instanceTemp2+topicNameTemp
        }
        $scope.$watch('topicName',function(){
            $scope.regulationShow = 'cn.useonline.iotcloud.'+$scope.username+instanceTopicChang();

        })

        $scope.$watch('instanceTemp',function(){
            $scope.regulationShow = 'cn.useonline.iotcloud.'+$scope.username+instanceTopicChang();
        })
        var init = function () {
            //$scope.rule_type = {id:'Rabbitmq',name:'Rabbitmq'};

            $scope.addTopicList = []; //{exchange:'',queue:false,persist:true,rule_type:''}
            $scope.remainTopicToAddCount = 5;
            $scope.addstrategy_content_topzero = "";
            //if($scope.item.modifyInDetail){
            //    $scope.modifyInDetail = 1
            //}else{
            //    $scope.modifyInDetail = 0
            //}
            if($scope.item.data) {
                $scope.instanceSel = true;
                getProjectList($scope.item.data.instance.id)
            }
            else{
                $scope.instanceSel = false;
                getProjectList()
            }

            if($scope.item.data){
                getProjectInfo($scope.item.data.instance.id)
            }

        }
        if ($scope.item.method == 'add') {
            init()
            $scope.name = '';
            $scope.instance = {};
            $scope.instanceTemp = '';
            $scope.topicName = '';

            $timeout(function () {
                if (angular.element('#addstrategy-content').height() >= angular.element(window).height()) {
                    //$scope.addstrategy_content_topzero = "addstrategy-content-topzero"
                }
            }, 100)

        } else if ($scope.item.method == 'modify') {
            init()
            var data = $scope.item.data;
            $scope.name = data.name;
            nameTemp = $scope.name;
            //$scope.instanceTemp = data.instance;
            $scope.topicName = data.topic;
            var instanceTopic = data.instance.topic;
            if(instanceTopic.endsWith('/')){
                instanceTopic = instanceTopic.substring(0,instanceTopic.length-1)
            }
            if($scope.topicName == instanceTopic || $scope.topicName == data.instance.topic){
                $scope.topicName = ''
            }else{
                $scope.topicName = $scope.topicName.replace(data.instance.topic,'');
            }

            //$scope.description = data.description;
            data.actuator = [];
            data.actuator = data.api_actuators;
            data.actuator = data.actuator.concat(data.rmq_actuators)
            if(data.actuator){
                $scope.remainTopicToAddCount = $scope.remainTopicToAddCount - data.actuator.length;
            }else{
                data.actuator = []
            }
            _.forEach(data.actuator, function (value) {
                //{exchange:'',queue:'',persist:true,rule_type:{id:'Rabbitmq',name:'Rabbitmq'}},{"api":"","method":{id:'GET',name:'GET'},"header":"","rule_type":{id:'Api',name:'Api'}}
                var topicItem = value;
                if(value['rule_type'] == 'API' || value['rule_type']['id'] == 'API'){
                    //topicItem['method'] = {id:value['method'],name:value['method']};
                    topicItem['rule_type'] = {id:'API',name:'API'};

                    if(value['method']['id']){
                        topicItem['method'] = {id:value['method']['id'],name:value['method']['id']};

                    }else{
                        topicItem['method'] = {id:value['method'],name:value['method']};
                    }

                }else{
                    topicItem['rule_type'] = {id:'RabbitMQ',name:'RabbitMQ'};
                }

                if(topicItem['id']){
                    topicItem['pk'] = topicItem['id'];
                    delete topicItem['id'];
                }

                //topicItem['rule_type'] = {id:value['rule_type'],name:value['rule_type']};
                $scope.addTopicList.push(topicItem)
            });
            $timeout(function () {
                if (angular.element('#addstrategy-content').height() >= angular.element(window).height()) {
                    //$scope.addstrategy_content_topzero = "addstrategy-content-topzero"
                }
            }, 100)

        }
        if ($scope.item.method == 'add' || $scope.item.method == 'modify') {
            isValid = true;
            invalidMsg = ''
            $scope.ok = function () {
                $scope.params = {
                    name: $scope.name,
                    //classification:$scope.classification,
                    //classification:'23',
                    instance: $scope.instanceTemp,
                    //topicName: $scope.topicName,
                    topic: $scope.topicName,
                    actuator: []
                };
                console.log('name',$scope.name)
                if ($scope.name == '' || $scope.name == null || typeof($scope.name) == 'undefined') {
                    isValid = false;
                    invalidMsg = '规则名称不能为空'
                }
                else if ($scope.item.method == 'modify' && nameTemp == $scope.name) {
                    delete $scope.params.name;
                }

                //if (isValid && baseUrl.dupInObjArr('name', $scope.addTopicList)) {
                //    isValid = false;
                //    invalidMsg = '主题不能重复'
                //}

                if (isValid && !$scope.instanceTemp) {
                    isValid = false;
                    invalidMsg = '请选择物接入实例'
                }

                if(isValid && $scope.topicName){
                    console.log('$scope.topicName',$scope.topicName)
                    var checkTopicRes = baseUrl.checkTopic($scope.topicName);
                    if(checkTopicRes.err == 1){
                        isValid = false;
                        invalidMsg = checkTopicRes.msg
                    }
                }

                var actuatorCheck = function () {
                    _.forEach($scope.addTopicList, function (value) {
                        if(value['api'] && !baseUrl.checkUrl(value['api'])){
                            isValid = false;
                            invalidMsg = '请输入正确的api';
                        }
                    });
                }

                if (isValid) {
                    actuatorCheck()
                }

                if (!isValid) {
                    baseUrl.ngDialog(invalidMsg)
                }

                if (isValid) {
                    _.forEach($scope.addTopicList, function (value) {
                        //{exchange:'',queue:'',persist:true,rule_type:{id:'Rabbitmq',name:'Rabbitmq'}},{"api":"","method":{id:'GET',name:'GET'},"header":"","rule_type":{id:'Api',name:'Api'}}
                        var item = value;
                        if(value['exchange']){
                           item['exchange'] = $scope.regulationShow
                           item['rule_type'] = value['rule_type']['id']

                       }else{
                            item['method'] = value['method']['id']
                            item['rule_type'] = value['rule_type']['id']
                       }
                        $scope.params.actuator.push(item)

                    });

                    $scope.params.actuator = JSON.stringify($scope.params.actuator);
                    if ($scope.item.method == 'add') {
                        $http.post(url + "/api/1/rule/", $scope.params).success(function (data) {
                            if (data.code == "200") {
                                $scope.item.scope.optipShow(1, '操作成功')
                                $scope.item.scope.submit_search();
                            }
                            //}else{
                            //    $scope.item.scope.optipShow(0, '操作失败,' + data.message)
                            //}
                        }).error(function () {
                            //ngDialog.open({
                            //    template: '<p style=\"text-align: center\">添加失败:'+data.description+'</p>',
                            //    plain: true
                            //});
                            $scope.item.scope.optipShow(0, '操作失败,' + data.description)
                        });
                    }//end if
                    else if ($scope.item.method == 'modify') {
                        $http.put(url + "/api/1/rule/" + $scope.item.data.id + "/", $scope.params).success(function (data) {
                            if (data.code == "200") {
                                $scope.item.scope.optipShow(1, '操作成功')
                                if($scope.item.modifyInDetail || $scope.item.modifyInDetail == 0) {
                                   // console.log('$scope.item.modifyInDetail',$scope.item.modifyInDetail)
                                    $scope.item.scope.regulationDetailFunc($scope.item.modifyInDetail);
                                }else{
                                    $scope.item.scope.submit_search();
                                }
                            }
                        }).error(function () {
                            //ngDialog.open({
                            //    template: '<p style=\"text-align: center\">添加失败:'+data.description+'</p>',
                            //    plain: true
                            //});
                            $scope.item.scope.optipShow(0, '操作失败,' + data.description)
                        });
                    }

                    //$uibModalInstance.close();
                    $scope.$emit('addstrategyclose', 'close')
                }

            }
        }//end if
    })

    $scope.addTopicList = []; //{exchange:'',queue:'',persist:true,rule_type:{id:'Rabbitmq',name:'Rabbitmq'}},{"api":"","method":{id:'GET',name:'GET'},"header":"","rule_type":{id:'Api',name:'Api'}}
    $scope.remainTopicToAddCount = 5;
    $scope.addstrategy_content_topzero = "";
    //选择存储类型
    $scope.setRuleType = function(rule_type,idx){

        if(rule_type.id == 'RabbitMQ'){
            $scope.addTopicList[idx] = {exchange:'cn.useonline.iotcloud.'+$scope.username,queue:'',persist:true,rule_type:{id:'RabbitMQ',name:'RabbitMQ'}};
        }else if(rule_type.id == 'API'){
            $scope.addTopicList[idx] = {"api":"","method":{id:'GET',name:'GET'},"header":"","rule_type":{id:'API',name:'API'}};
        }

    }

    //选择调用方式
    $scope.setMethod = function(method,idx){
        console.log('test',$scope.addTopicList[idx]['method'])
    }

    $scope.addPersist = function (idx, type) {
        $scope.addTopicList[idx][type] = !$scope.addTopicList[idx][type];
    }
    $scope.addTopicFunc = function () {
        if($scope.instanceTemp){
            $scope.remainTopicToAddCount--;
            var topicTemp = {exchange:'cn.useonline.iotcloud.'+$scope.username,queue:'',persist:true,rule_type:{id:'RabbitMQ',name:'RabbitMQ'}}
            if($scope.item.method == 'modify'){
                topicTemp['pk'] = ''
            }
            $scope.addTopicList.push(topicTemp)
            $timeout(function () {
                if (angular.element('#addstrategy-content').height() >= angular.element(window).height()) {
                    //$scope.addstrategy_content_topzero = "addstrategy-content-topzero"
                }
            }, 100)
        }else{
            baseUrl.ngDialog('请先选择物接入实例')
        }

    }
    $scope.delTopicFunc = function (idx) {
        $scope.remainTopicToAddCount++;
        _.pullAt($scope.addTopicList, [idx]);
        $timeout(function () {
            if (angular.element('#addstrategy-content').height() < angular.element(window).height()) {
                //$scope.addstrategy_content_topzero = ""
            }
        }, 100)
    }
    $scope.setModel = function (idx) {
        return 'topic' + idx;
    }


});

$.fn.datepicker.dates['zh'] = {
    days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
    daysShort: ["日", "一", "二", "三", "四", "五", "六", "日"],
    daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    monthsShort: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"],
    meridiem: ["上午", "下午"],
    //suffix:      ["st", "nd", "rd", "th"],
    today: "今天"
};











