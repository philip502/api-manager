var projectTableOptions = {
    container: "#editTable",
    headers: [
        {text: '项目编号', width: '15%'},
        {text: '项目名称', width: '15%'},
        {text: '所属部门', width: '15%'},
        {text: '项目简述', width: '30%'},
        {text: '操作', width: '25%'}
    ],
    form: '#form',
    fields: [
        {name: 'id', type: 'input', inputDesc: '项目编号', required: false},
        {name: 'projectName', type: 'input', inputDesc: '项目名称', required: true},
        {name: 'depId', type:'select', inputDesc: '所属部门', required: true, options:{
                optionField: {value: 'id', text: 'depName'},
                url: '/apimanager/department/list'
        }},
        {name: 'projectDesc', type: 'input', inputDesc: '项目描述', required: false}

    ],
    rowButtons: [
        {type: 'update', text: '编辑', url: '/apimanager/project/update'},
        {type: 'save', text: '保存', url: '/apimanager/project/add'},
        {type: 'delete', text: '删除', url: '/apimanager/project/delete'},
        {type: 'enter', text: '进入', fn: function (param) {
            var parentId = param['id'];
            var depId = param['depId'];
            var conf = {
                container: '#container',
                url: 'html/module/module.html',
                content: "",
                async: false,
                preLoad: function (content) {
                    $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"moduleClick1()\">Module</a></li>");
                },
                loaded: function () {
                    var depOptions = {
                        selector: '[name=depId]',
                        optionField: {value: 'id', text: 'depName'},
                        width: '131px',
                        url: '/apimanager/department/list',
                        change: function (e, p) {
                            projectSelect.clear();
                            var param = {};
                            param['depId']=e.target.value;
                            projectSelect.load(param);
                            projectSelect.val(parentId);
                        }
                    };
                    var projectOptions = {
                        selector: '[name=projectId]',
                        optionField: {value: 'id', text: 'projectName'},
                        width: '131px',
                        url: '/apimanager/project/list'
                    };
                    var projectSelect = api.ui.chosenSelect(projectOptions);
                    api.ui.chosenSelect(depOptions).val(depId);
                    api.util.loadScript("html/module/js/module.js" ,function () {
                        api.ui.editTable(moduleTableOptions);
                    });
                }
            }
            api.ui.load(conf);
        }}
    ],
    headBtn: [
        {
            type: 'add', text: '添加', fn: function (row) {
                row.find('select').val($("form select[name=depId]").val());
            }
        }
    ],
    url: '/apimanager/project/findPage'
};