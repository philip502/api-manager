;(function ($, window, document, undefined) {
    var param = function (options) {
        var options = this.options = $.extend({}, param.defaults, options);
        var jq = this.jq = ('string' == typeof options.container) ? $(options.container) : options.container;
        var that = this;
        this._build();
        if(options.data)(
            $.each(options.data, function (index, row) {
                that._showRow(row);
            })
        )
    };

    param.prototype = {
        _build: function () {
            var that = this, jq = this.jq, conf = this.options, fields = conf.fields, headers = conf.headers, footBtn = conf.footBtn;
            var $table = $('<table class="table table-bordered table-sm" style="font-size: 15px;"></table>');
            var $tHead = $('<thead></thead>');
            var $tBody = $('<tbody></tbody>');
            var $tFoot = $('<tfoot></tfoot>');
            if (headers) {
                var $tr = $('<tr style="background-color: #e3e3e3"></tr>');
                $.each(headers, function (index, header) {
                    $tr.append($('<th style="padding-left: 10px; height: 10px;"></th>').css('width', header.width).text(header.text));
                });
                $tHead.append($tr);
            }

            $tFoot.append($('<tr></tr>').append($('<td></td>').attr('colspan', headers.length)));
            if (footBtn) {
                $.each(footBtn, function (index, footBtn) {
                    var type = footBtn.type;
                    if (type == 'add') {
                        var $addBtn = $('<button class="btn btn-success btn-sm" type="button"><span class="glyphicon glyphicon-plus"></span></button>').append('&nbsp;' + footBtn.text);
                        $addBtn.on('click', function () {
                            if(that._checkEmpty()){
                                var options = {
                                    content: '存在未完成的字段名称！'
                                };
                                api.ui.dialog(options).open();
                                return false;
                            }
                            if(that.defaultFlag==1){
                                var options = {
                                    content: '请输入数字！'
                                };
                                api.ui.dialog(options).open();
                                return false;
                            }
                            that._addRow();
                            footBtn.fn && footBtn.fn();
                        });
                        $tFoot.find('td').append($addBtn);
                    } else if(type == 'import') {
                        var $importBtn = $('<button class="btn btn-success btn-sm importBtn" type="button" style="margin-left:6px;"></button>').append('&nbsp;' + footBtn.text);
                        $tFoot.find('td').append($importBtn);
                    } else if(type == 'clear'){
                        var $clearBtn = $('<button class="btn btn-success btn-sm cleartBtn" type="button" style="margin-left:6px;"></button>').append('&nbsp;' + footBtn.text);
                        $clearBtn.on('click', function () {
                            that._empty();
                        });
                        $tFoot.find('td').append($clearBtn);
                    } else {
                        var $footBtn = $('<button class="btn btn-success btn-sm" type="button" style="margin-left:6px;"></button>').append('&nbsp;' + footBtn.text);
                        $footBtn.addClass(footBtn.className);
                        $tFoot.find('td').append($footBtn);
                    }
                })
            }

            jq.append($table.css('width', conf.width).append($tHead).append($tBody).append($tFoot));
            return this;
        },
        _addRow: function () {
            var that = this, jq = this.jq, conf = this.options, fields = conf.fields, $tr = $('<tr childrenCount="0"></tr>');
            var $operate = $('<td class="td-item-operate" align="right"></td>');
            var $addLink = $('<span class="glyphicon glyphicon-plus" style="margin-top: 10px; color: #1e7e34; cursor: pointer; display: none;"></span>');
            var $removeLink = $('<span class="glyphicon glyphicon-remove" style="margin-left: 10px; margin-top: 10px; cursor: pointer; color: #ab1e1e"></span>');
            $removeLink.mousedown(function () {
                delete that.defaultFlag;
                function removeChildren(identity) {
                    var children = jq.find('tbody tr[parent=' + identity + ']');
                    $.each(children, function (index, child) {
                        var $child = $(child);
                        var identity = $child.attr('identity');
                        removeChildren(identity);
                        $child.remove();
                    })
                }
                removeChildren($tr.attr('identity'));
                $tr.remove();
            });
            $addLink.on('click', function () {
                if(that._checkEmpty()){
                    var options = {
                        content: '存在未完成的字段名称！'
                    };
                    api.ui.dialog(options).open();
                    return that;
                }
                if(that.defaultFlag==1){
                    var options = {
                        content: '请输入数字！'
                    };
                    api.ui.dialog(options).open();
                    return that;
                }
                that._after($tr);
            });
            $operate.append($addLink).append($removeLink);
            $tr.append($operate).attr('identity', 'tr-' + api.util.generateNumber()).attr('level', 'root');
            $.each(fields, function (index, field) {
                var $td = $('<td class="td-item" style="padding-left: 10px;"></td>');
                if(field.type == 'input'){
                    var $input = $('<input class="form-control td-item-input" type="text" style="height: 100%;"/>');
                    $input.attr('name', field.name);
                    $tr.append($td.append($input));
                } else if(field.type == 'select'){
                    var chosenOptions = field.options, $selector = $('<select class="form-control"></select>');
                    $selector.attr('name', field.name);
                    chosenOptions.selector = $selector;
                    if(field.name == 'type'){
                        chosenOptions.change = function (event) {
                            var value = event.target.value;
                            if(value > 3){
                                $addLink.css('display', '');
                                $addLink.attr('oldDisplay', '');
                                $tr.find('input[name=defaultVal]').val('');
                                $tr.find('input[name=rule]').val('');
                            } else {
                                $addLink.attr('oldDisplay', 'none');
                                $addLink.css('display', 'none');
                                if(value == 3){
                                    $tr.find('input[name=defaultVal]').val(false);
                                    $tr.find('input[name=rule]').val('1:true');
                                } else if(value == 2){
                                    $tr.find('input[name=defaultVal]').val('');
                                    $tr.find('input[name=rule]').val('1-6:ab');
                                } else if(value == 1){
                                    $tr.find('input[name=defaultVal]').val(0);
                                    $tr.find('input[name=rule]').val('1-100:10');
                                } else if(value == 0){
                                    var date = new Date();
                                    $tr.find('input[name=defaultVal]').val(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds());
                                    $tr.find('input[name=rule]').val('@datetime');
                                }
                            }
                            if(value < 5){
                                $tr.find('input[name=name]').attr('disabled', false);
                            }
                            function removeChildren(identity) {
                                var children = jq.find('tbody tr[parent=' + identity + ']');
                                $.each(children, function (index, child) {
                                    var $child = $(child);
                                    var identity = $child.attr('identity');
                                    removeChildren(identity);
                                    $child.remove();
                                })
                            }
                            removeChildren($tr.attr('identity'));
                            $tr.attr('childrenCount', 0);
                        }
                    }
                    api.ui.chosenSelect(chosenOptions);
                    $tr.append($td.append($selector));
                }
            });
            $tr.find('input[name=rule]').val('1-6:ab');
            $tr.find('input[name=defaultVal]').on('blur', function () {
                if($tr.find('select[name=type]').val()==1){
                    var regPos = /^(-?\d+)(\.\d+)?$/; // 浮点数
                    var $default = $tr.find('input[name=defaultVal]');
                    if(!regPos.test($default.val())){
                        var options = {
                            content: '请输入数字！'
                        };
                        api.ui.dialog(options).open();
                        that.defaultFlag = 1;
                        $default.val(0);
                        $default.css('border-color','red');
                        return false;
                    }else {
                        delete that.defaultFlag;
                        $default.css('border-color','');
                    }
                }
                //校验日期
                if($tr.find('select[name=type]').val()==0){
                    var regPos = /^([1-2]\d{3})[\/|\-](0?[1-9]|10|11|12)[\/|\-]([1-2]?[0-9]|0[1-9]|30|31) ([0-1]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/; // 浮点数
                    var $default = $tr.find('input[name=defaultVal]');
                    if($default.val()){
                        if(!regPos.test($default.val())){
                            var options = {
                                content: '请输入yyyy-mm-dd HH:MM:ss格式日期！'
                            };
                            api.ui.dialog(options).open();
                            that.defaultFlag = 1;
                            var date = new Date();
                            $default.val(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds());
                            $default.css('border-color','red');
                            return false;
                        }else {
                            delete that.defaultFlag;
                            $default.css('border-color','');
                        }
                    }
                }
                //校验boolean
                if($tr.find('select[name=type]').val()==3){
                    var $default = $tr.find('input[name=defaultVal]');
                    if($default.val().toUpperCase() != 'TRUE' && $default.val().toUpperCase() != 'FALSE'){
                        var options = {
                            content: '请输入"true"或者"false"！'
                        };
                        api.ui.dialog(options).open();
                        that.defaultFlag = 1;
                        $default.val('false');
                        $default.css('border-color','red');
                        return false;
                    }else {
                        delete that.defaultFlag;
                        $default.css('border-color','');
                    }
                }
            })
            jq.find('tbody').append($tr);
            return this;
        },
        _after: function ($row) {
            var that = this, jq = this.jq, conf = this.options, fields = conf.fields, $tr = $('<tr childrenCount="0"></tr>'), parentType = $row.find('select[name=type]').val();
            var $operate = $('<td class="td-item-operate" align="right"></td>');
            var $addLink = $('<span class="glyphicon glyphicon-plus" style="margin-top: 10px; color: #1e7e34; cursor: pointer; display: none;"></span>');
            var $removeLink = $('<span class="glyphicon glyphicon-remove" style="margin-left: 10px; margin-top: 10px; cursor: pointer; color: #ab1e1e"></span>');
            $removeLink.mousedown(function () {
                delete that.defaultFlag;
                function removeChildren(identity) {
                    var children = jq.find('tbody tr[parent=' + identity + ']');
                    $.each(children, function (index, child) {
                        var $child = $(child);
                        var identity = $child.attr('identity');
                        removeChildren(identity);
                        $child.remove();
                    })
                }
                removeChildren($tr.attr('identity'));
                $tr.remove();
                var parentTypeValue = $row.find('select[name=type]').val();
                if(parentTypeValue >= 5 && parseInt($row.attr('childrenCount')) > 0){
                    var children = jq.find('tbody tr[parent=' + $row.attr('identity') + ']'), len = children.length;
                    $.each(children, function (index, child) {
                        var $child = $(child);
                        $child.find('input[name=name]').val('array[' + (len - index - 1) + ']')
                    })
                    $row.attr('childrenCount', parseInt($row.attr('childrenCount')) - 1);
                }
            });
            $addLink.on('click', function () {
                if(that._checkEmpty()||that.defaultFlag==1){
                    var options = {
                        content: '存在未完成的字段名称！'
                    };
                    api.ui.dialog(options).open();
                    return that;
                }
                if(that.defaultFlag==1){
                    var options = {
                        content: '请输入数字！'
                    };
                    api.ui.dialog(options).open();
                    return that;
                }
                that._after($tr);
            });
            $operate.append($addLink).append($removeLink);
            $tr.append($operate).attr('identity', 'tr-' + api.util.generateNumber()).attr('parent', $row.attr('identity'));

            var padding = $row.children('td').eq(1).children('input').css('padding-left');
            $.each(fields, function (index, field) {
                var $td = $('<td class="td-item" style="padding-left: 10px;"></td>').css('background-color', '#9fcdff');
                if(field.type == 'input'){
                    var $input = $('<input class="form-control td-item-input" type="text" style="height: 100%;"/>');
                    if(field.name == 'name'){
                        $input.css('padding-left', (parseInt(padding.replace('px', '')) + 20) + 'px');
                        if(parentType >= 5){
                            $input.val('array[' + $row.attr('childrenCount') + ']');
                            $input.attr('disabled', true).css('background-color', 'white');
                            $input.attr('arrayElement', true);
                        }
                    }
                    $input.attr('name', field.name);
                    $tr.append($td.append($input));
                } else if(field.type == 'select'){
                    var chosenOptions = field.options, $selector = $('<select class="form-control"></select>');
                    $selector.attr('name', field.name);
                    chosenOptions.selector = $selector;
                    if(field.name == 'type'){
                        chosenOptions.change = function (event) {
                            var target = event.target, value = target.value;;
                            if(value > 3){
                                $addLink.attr('oldDisplay', '');
                                $addLink.css('display', '');
                                $tr.find('input[name=defaultVal]').val('');
                                $tr.find('input[name=rule]').val('');
                            } else {
                                $addLink.attr('oldDisplay', 'none');
                                $addLink.css('display', 'none');
                                if(value == 3){
                                    $tr.find('input[name=defaultVal]').val(false);
                                    $tr.find('input[name=rule]').val('1:true');
                                } else if(value == 2){
                                    $tr.find('input[name=defaultVal]').val('');
                                    $tr.find('input[name=rule]').val('1-6:ab');
                                } else if(value == 1){
                                    $tr.find('input[name=defaultVal]').val(0);
                                    $tr.find('input[name=rule]').val('1-100:10');
                                } else if(value == 0){
                                    var date = new Date();
                                    $tr.find('input[name=defaultVal]').val(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds());
                                    $tr.find('input[name=rule]').val('@datetime');
                                }
                            }
                            if(value < 5){
                                $tr.find('input[name=name]').attr('disabled', false);
                                $tr.find('input[name=name]').attr('arrayElement', false);
                                $tr.find('select[name=type]').attr('arrayElement', false);
                            }
                            function removeChildren(identity) {
                                var children = jq.find('tbody tr[parent=' + identity + ']');
                                $.each(children, function (index, child) {
                                    var $child = $(child);
                                    var identity = $child.attr('identity');
                                    removeChildren(identity);
                                    $child.remove();
                                })
                            }
                            removeChildren($tr.attr('identity'));
                        }
                        if(parentType >= 5 ){
                            $selector.attr('arrayElement', true);
                        }
                    }
                    var chosen = api.ui.chosenSelect(chosenOptions);
                    if(field.name == 'type'){
                        if(parentType == 6){
                            chosen.val(1);
                            chosen.doChange();
                            chosen.disable();
                        } else if(parentType == 7){
                            chosen.val(2);
                            chosen.doChange();
                            chosen.disable();
                        } else if(parentType == 8){
                            chosen.val(3);
                            chosen.doChange();
                            chosen.disable();
                        } else if(parentType == 9){
                            chosen.val(4);
                            chosen.doChange();
                            chosen.disable();
                        }
                        if(chosen.val() == 4){
                            $addLink.attr('oldDisplay', '');
                            $addLink.css('display', '');
                            $tr.find('input[name=defaultVal]').val('');
                        }
                    }
                    $tr.append($td.append($selector));
                }
            });
            $tr.find('input[name=rule]').val('1-6:ab');
            $tr.find('input[name=defaultVal]').on('blur',  function () {
                if($tr.find('select[name=type]').val()==1){
                    var regPos = /^(-?\d+)(\.\d+)?$/; // 浮点数
                    var $default = $tr.find('input[name=defaultVal]');
                    if(!regPos.test($default.val())){
                        var options = {
                            content: '请输入数字！'
                        };
                        api.ui.dialog(options).open();
                        that.defaultFlag = 1;
                        $default.val(0);
                        $default.css('border-color','red');
                        return false;
                    }else {
                        delete that.defaultFlag;
                        $default.css('border-color','');
                    }
                }
                //校验日期
                if($tr.find('select[name=type]').val()==0){
                    var regPos = /^([1-2]\d{3})[\/|\-](0?[1-9]|10|11|12)[\/|\-]([1-2]?[0-9]|0[1-9]|30|31) ([0-1]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/; // 浮点数
                    var $default = $tr.find('input[name=defaultVal]');
                    if($default.val()){
                        if(!regPos.test($default.val())){
                            var options = {
                                content: '请输入yyyy-mm-dd HH:MM:ss格式日期！'
                            };
                            api.ui.dialog(options).open();
                            that.defaultFlag = 1;
                            var date = new Date();
                            $default.val(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds());
                            $default.css('border-color','red');
                            return false;
                        }else {
                            delete that.defaultFlag;
                            $default.css('border-color','');
                        }
                    }
                }
                //校验boolean
                if($tr.find('select[name=type]').val()==3){
                    var $default = $tr.find('input[name=defaultVal]');
                    if($default.val().toUpperCase() != 'TRUE' && $default.val().toUpperCase() != 'FALSE'){
                        var options = {
                            content: '请输入"true"或者"false"！'
                        };
                        api.ui.dialog(options).open();
                        that.defaultFlag = 1;
                        $default.val('false');
                        $default.css('border-color','red');
                        return false;
                    }else {
                        delete that.defaultFlag;
                        $default.css('border-color','');
                    }
                }
            })
            $row.after($tr);
            $row.attr('childrenCount', parseInt($row.attr('childrenCount')) + 1);
            return this;
        },
        _showRow: function (rowData) {
            var that = this, jq = this.jq, conf = this.options, fields = conf.fields, $tr = $('<tr childrenCount="0"></tr>');
            var $operate = $('<td class="td-item-operate" align="right"></td>');
            var $addLink = $('<span class="glyphicon glyphicon-plus" style="margin-top: 10px; color: #1e7e34; cursor: pointer; display: none;"></span>');
            var $removeLink = $('<span class="glyphicon glyphicon-remove" style="cursor: pointer; margin-left: 10px; margin-top: 10px; color: #ab1e1e"></span>');
            $removeLink.mousedown(function () {
                delete that.defaultFlag;
                function removeChildren(identity) {
                    var children = jq.find('tbody tr[parent=' + identity + ']');
                    $.each(children, function (index, child) {
                        var $child = $(child);
                        var identity = $child.attr('identity');
                        removeChildren(identity);
                        $child.remove();
                    })
                }
                removeChildren($tr.attr('identity'));
                $tr.remove();
            });
            $addLink.on('click', function () {
                if(that._checkEmpty()){
                    var options = {
                        content: '存在未完成的字段名称！'
                    };
                    api.ui.dialog(options).open();
                    return that;
                }
                if(that.defaultFlag==1){
                    var options = {
                        content: '请输入数字！'
                    };
                    api.ui.dialog(options).open();
                    return that;
                }
                that._after($tr);
            });
            $operate.append($addLink).append($removeLink);
            $tr.append($operate).attr('identity', 'tr-' + api.util.generateNumber()).attr('level', 'root');
            $.each(fields, function (index, field) {
                var $td = $('<td class="td-item" style="padding-left: 10px;"></td>');
                if(field.type == 'input'){
                    var $input = $('<input class="form-control td-item-input" type="text" style="height: 100%;"/>');
                    $input.attr('name', field.name).val(rowData[field.name]);
                    $tr.append($td.append($input));
                } else if(field.type == 'select'){
                    var chosenOptions = field.options, $selector = $('<select class="form-control"></select>');
                    $selector.attr('name', field.name);
                    chosenOptions.selector = $selector;
                    if(field.name == 'type'){
                        chosenOptions.change = function (event) {
                            var value = event.target.value;
                            if(value > 3){
                                $addLink.attr('oldDisplay', '');
                                $addLink.css('display', '');
                                $tr.find('input[name=defaultVal]').val('');
                            } else {
                                $addLink.attr('oldDisplay', 'none');
                                $addLink.css('display', 'none');
                                if(value == 3){
                                    $tr.find('input[name=defaultVal]').val(false);
                                    $tr.find('input[name=rule]').val('1:true');
                                } else if(value == 2){
                                    $tr.find('input[name=defaultVal]').val('');
                                    $tr.find('input[name=rule]').val('1-6:ab');
                                } else if(value == 1){
                                    $tr.find('input[name=defaultVal]').val(0);
                                    $tr.find('input[name=rule]').val('1-100:10');
                                } else if(value == 0){
                                    var date = new Date();
                                    $tr.find('input[name=defaultVal]').val(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds());
                                    $tr.find('input[name=rule]').val('@datetime');
                                }
                            }
                            if(value < 5){
                                $tr.find('input[name=name]').attr('disabled', false);
                                $tr.find('input[name=name]').attr('arrayElement', false);
                                $tr.find('select[name=type]').attr('arrayElement', false);
                            }
                            function removeChildren(identity) {
                                var children = jq.find('tbody tr[parent=' + identity + ']');
                                $.each(children, function (index, child) {
                                    var $child = $(child);
                                    var identity = $child.attr('identity');
                                    removeChildren(identity);
                                    $child.remove();
                                })
                            }
                            removeChildren($tr.attr('identity'));
                            $tr.attr('childrenCount', 0);
                        }
                    }
                    chosenOptions.selectedVal = rowData[field.name];
                    var chosen = api.ui.chosenSelect(chosenOptions);
                    // chosen.val(rowData[field.name]);
                    chosen.doChange();
                    $tr.append($td.append($selector));
                }
            });

            $tr.find('input[name=defaultVal]').on('blur',  function () {
                if($tr.find('select[name=type]').val()==1){
                    var regPos = /^(-?\d+)(\.\d+)?$/; // 浮点数
                    var $default = $tr.find('input[name=defaultVal]');
                    if(!regPos.test($default.val())){
                        var options = {
                            content: '请输入数字！'
                        };
                        api.ui.dialog(options).open();
                        that.defaultFlag = 1;
                        $default.val(0);
                        $default.css('border-color','red');
                        return false;
                    }else {
                        delete that.defaultFlag;
                        $default.css('border-color','');
                    }
                }
                //校验日期
                if($tr.find('select[name=type]').val()==0){
                    var regPos = /^([1-2]\d{3})[\/|\-](0?[1-9]|10|11|12)[\/|\-]([1-2]?[0-9]|0[1-9]|30|31) ([0-1]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/; // 浮点数
                    var $default = $tr.find('input[name=defaultVal]');
                    if($default.val()){
                        if(!regPos.test($default.val())){
                            var options = {
                                content: '请输入yyyy-mm-dd HH:MM:ss格式日期！'
                            };
                            api.ui.dialog(options).open();
                            that.defaultFlag = 1;
                            var date = new Date();
                            $default.val(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds());
                            $default.css('border-color','red');
                            return false;
                        }else {
                            delete that.defaultFlag;
                            $default.css('border-color','');
                        }
                    }
                }
                //校验boolean
                if($tr.find('select[name=type]').val()==3){
                    var $default = $tr.find('input[name=defaultVal]');
                    if($default.val().toUpperCase() != 'TRUE' && $default.val().toUpperCase() != 'FALSE'){
                        var options = {
                            content: '请输入"true"或者"false"！'
                        };
                        api.ui.dialog(options).open();
                        that.defaultFlag = 1;
                        $default.val('false');
                        $default.css('border-color','red');
                        return false;
                    }else {
                        delete that.defaultFlag;
                        $default.css('border-color','');
                    }
                }
            })

            function afterRow($parentTr, childRowData) {
                var requestType = $parentTr.find('select[name=type]').val()
                $.each(childRowData, function (index, childFiledData) {
                    var $tr = $('<tr childrenCount="0"></tr>');
                    var $operate = $('<td class="td-item-operate" align="right"></td>');
                    var $addLink = $('<span class="glyphicon glyphicon-plus" style="cursor: pointer; margin-top: 10px; color: #1e7e34; display: none;"></span>');
                    var $removeLink = $('<span class="glyphicon glyphicon-remove" style="cursor: pointer; margin-left: 10px; margin-top: 10px; color: #ab1e1e"></span>');
                    $removeLink.mousedown(function () {
                        delete that.defaultFlag;
                        function removeChildren(identity) {
                            var children = jq.find('tbody tr[parent=' + identity + ']');
                            $.each(children, function (index, child) {
                                var $child = $(child);
                                var identity = $child.attr('identity');
                                removeChildren(identity);
                                $child.remove();
                            })
                        }
                        removeChildren($tr.attr('identity'));
                        $tr.remove();

                        var parentTypeValue = $parentTr.find('select[name=type]').val();
                        if(parentTypeValue >= 5 && parseInt($parentTr.attr('childrenCount')) > 0){
                            var children = jq.find('tbody tr[parent=' + $parentTr.attr('identity') + ']'), len = children.length;
                            $.each(children, function (index, child) {
                                var $child = $(child);
                                $child.find('input[name=name]').val('array[' + (len - index - 1) + ']')
                            })
                            $parentTr.attr('childrenCount', parseInt($parentTr.attr('childrenCount')) - 1);
                        }

                    });
                    $addLink.on('click', function () {
                        if(that._checkEmpty()){
                            var options = {
                                content: '存在未完成的字段名称！'
                            };
                            api.ui.dialog(options).open();
                            return that;
                        }
                        if(that.defaultFlag==1){
                            var options = {
                                content: '请输入数字！'
                            };
                            api.ui.dialog(options).open();
                            return that;
                        }
                        that._after($tr);
                    });
                    $operate.append($addLink).append($removeLink);
                    $tr.append($operate).attr('identity', 'tr-' + api.util.generateNumber()).attr('parent', $parentTr.attr('identity'));

                    var padding = $parentTr.children('td').eq(1).children('input').css('padding-left');
                    $.each(fields, function (index, field) {
                        var $td = $('<td class="td-item" style="padding-left: 10px;"></td>').css('background-color', '#9fcdff');
                        if(field.type == 'input'){
                            var $input = $('<input class="form-control td-item-input" type="text" style="height: 100%;"/>');
                            if(field.name == 'name'){
                                $input.css('padding-left', (parseInt(padding.replace('px', '')) + 20) + 'px');
                                if(requestType >= 5){
                                    $input.attr('disabled', true).css('background-color', 'white');
                                    $input.attr('arrayElement', true);
                                }
                            }
                            $input.attr('name', field.name).val(childFiledData[field.name]);
                            $tr.append($td.append($input));
                        } else if(field.type == 'select'){
                            var chosenOptions = field.options, $selector = $('<select class="form-control"></select>');
                            $selector.attr('name', field.name);
                            chosenOptions.selector = $selector;
                            if(field.name == 'type'){
                                chosenOptions.change = function (event) {
                                    var value = event.target.value;;
                                    if(value > 3){
                                        $addLink.attr('oldDisplay', '');
                                        $addLink.css('display', '');
                                        $tr.find('input[name=defaultVal]').val('');
                                    } else {
                                        $addLink.attr('oldDisplay', 'none');
                                        $addLink.css('display', 'none');
                                        if(value == 3){
                                            $tr.find('input[name=defaultVal]').val(false);
                                            $tr.find('input[name=rule]').val('1:true');
                                        } else if(value == 2){
                                            $tr.find('input[name=defaultVal]').val('');
                                            $tr.find('input[name=rule]').val('1-6:ab');
                                        } else if(value == 1){
                                            $tr.find('input[name=defaultVal]').val(0);
                                            $tr.find('input[name=rule]').val('1-100:10');
                                        } else if(value == 0){
                                            var date = new Date();
                                            $tr.find('input[name=defaultVal]').val(date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds());
                                            $tr.find('input[name=rule]').val('@datetime');
                                        }
                                    }
                                    if(value < 5){
                                        $tr.find('input[name=name]').attr('disabled', false);
                                        $tr.find('input[name=name]').attr('arrayElement', false);
                                        $tr.find('select[name=type]').attr('arrayElement', false);
                                    }
                                    function removeChildren(identity) {
                                        var children = jq.find('tbody tr[parent=' + identity + ']');
                                        $.each(children, function (index, child) {
                                            var $child = $(child);
                                            var identity = $child.attr('identity');
                                            removeChildren(identity);
                                            $child.remove();
                                        })
                                    }
                                    removeChildren($tr.attr('identity'));
                                    $tr.attr('childrenCount', 0);
                                }
                                if(requestType >= 5){
                                    $selector.attr('arrayElement', true);
                                }
                                $tr.attr('childrenCount', 0);
                            }
                            chosenOptions.selectedVal = childFiledData[field.name];
                            var chosen = api.ui.chosenSelect(chosenOptions);
                            chosen.doChange();
                            if($selector.attr('arrayElement')){
                                chosen.disable();
                            }
                            $tr.append($td.append($selector));
                        }
                    });
                    $tr.find('input[name=defaultVal]').on('blur',  function () {
                        if($tr.find('select[name=type]').val()==1){
                            var regPos = /^(-?\d+)(\.\d+)?$/; // 浮点数
                            var $default = $tr.find('input[name=defaultVal]');
                            if(!regPos.test($default.val())){
                                var options = {
                                    content: '请输入数字！'
                                };
                                api.ui.dialog(options).open();
                                that.defaultFlag = 1;
                                $default.val(0);
                                $default.css('border-color','red');
                                return false;
                            }else {
                                delete that.defaultFlag;
                                $default.css('border-color','');
                            }
                        }
                        //校验日期
                        if($tr.find('select[name=type]').val()==0){
                            var regPos = /^([1-2]\d{3})[\/|\-](0?[1-9]|10|11|12)[\/|\-]([1-2]?[0-9]|0[1-9]|30|31) ([0-1]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/; // 浮点数
                            var $default = $tr.find('input[name=defaultVal]');
                            if($default.val()){
                                if(!regPos.test($default.val())){
                                    var options = {
                                        content: '请输入yyyy-mm-dd MM:MM:ss格式日期！'
                                    };
                                    api.ui.dialog(options).open();
                                    that.defaultFlag = 1;
                                    var date = new Date();
                                    $default.val(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds());
                                    $default.css('border-color','red');
                                    return false;
                                }else {
                                    delete that.defaultFlag;
                                    $default.css('border-color','');
                                }
                            }
                        }
                        //校验boolean
                        if($tr.find('select[name=type]').val()==3){
                            var $default = $tr.find('input[name=defaultVal]');
                            if($default.val().toUpperCase() != 'TRUE' && $default.val().toUpperCase() != 'FALSE'){
                                var options = {
                                    content: '请输入"true"或者"false"！'
                                };
                                api.ui.dialog(options).open();
                                that.defaultFlag = 1;
                                $default.val('false');
                                $default.css('border-color','red');
                                return false;
                            }else {
                                delete that.defaultFlag;
                                $default.css('border-color','');
                            }
                        }
                    })

                    $parentTr.after($tr);
                    $parentTr.attr('childrenCount', parseInt($parentTr.attr('childrenCount')) + 1);
                    var children = childFiledData.child;
                    if(children && children.length > 0){
                        $addLink.css('display', '');
                        afterRow($tr, children);
                    }
                });
            }

            jq.find('tbody').append($tr);
            var children = rowData.child;
            if(children && children.length > 0){
                $addLink.css('display', '');
                afterRow($tr, children);
            }
            return this;
        },
        _checkEmpty: function () {
            var that = this, jq = this.jq, checkResult = false;
            jq.find('tbody tr td .td-item-input[name=name]').each(function () {
                var $input = $(this);
                if(!$input.val()){
                    $input.css('border-color', '#FF2F2F');
                    checkResult = true;
                    $input.on('blur', function () {
                        if($input.val() && $input.val().trim()){
                            $input.css('border-color', '');
                        }
                    })
                }
            });
            return checkResult;
        },
        _empty: function () {
            var that = this, jq = this.jq;
            jq.find('tbody').empty();
            return this;
        },
        toData: function () {
            var that = this, jq = this.jq, rootArray = [], rootRows = jq.find('tr[level=root]')
            function deal(rows, array){
                $.each(rows, function (index, row) {
                    var data = {}, $row = $(row), nextRows = jq.find('tr[parent=' + $row.attr('identity') + ']');
                    $row.find('input,select').each(function () {
                        data[this.name] = this.value;
                    })
                    if(nextRows.length > 0){
                        var child = [];
                        data['child'] = child;
                        deal(nextRows, child);
                    }
                    array.push(data);
                })
            }
            deal(rootRows, rootArray);
            return rootArray;
        },
        disable: function () {
            var jq = this.jq;
            jq.find('input,select,textarea').attr('disabled', true).css('background-color', 'white');
            jq.find('tfoot button').css('display', 'none');
            jq.find('.td-item-operate span').each(function () {
                var $this = $(this);
                // 判断属性是否存在
                if(typeof $this.attr("oldDisplay") == "undefined"){
                    $this.attr('oldDisplay', $this.css('display'));
                }
                $this.css('display', 'none');
            });

            return this;
        },
        enable: function () {
            var jq = this.jq;
            jq.find('input[arrayElement!=true],select[arrayElement!=true],textarea').attr('disabled', false);
            jq.find('tfoot button').css('display', '');
            jq.find('.td-item-operate span').each(function () {
                var $this = $(this);
                $this.css('display', $this.attr('oldDisplay'));
            });
            return this;
        }
    };
    param.defaults = {
        container: '',
        width: '100%',
        data: {},
        url: undefined
    };
    api.ui.param = function (options) {
        return new param(options);
    }
})(jQuery, window, document);