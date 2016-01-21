(function(w, d, $, a, u) {

    var component = {
        name: "sw.autocomplete",//组件名称
        version: "0.1-SNAPSHOT"    //版本号
    }

    if(!($=w[$])) throw "This component ["+component.name+"] requires jQuery.";

    // 保存数据
    var map = {},
        selectedClass = "sw_ac_selected",
        focusClass = "sw_ac_focus",
        itemData = "sw_ac_list_item_data"

    // 组件方法
    var methods = {
        /**
         * 显示自动完成面板
         */
        show: function() {
            var $this = $(this),
                options = util.getOptions($this),
                $panel = util.getSelectPanel($this)
            if($panel.is(":hidden")) {
                $this
                    .css("border-bottom-left-radius", 0)
                    .css("border-bottom-right-radius", 0)
                $panel
                    .show("fast", options.showedHandler);
                $.isFunction(options.showingHandler) && options.showingHandler.call($this)
            }
            return $this
        },

        /**
         * 关闭自动完成列表
         */
        close: function() {
            var $this = $(this),
                $panel = util.getSelectPanel($this),
                options = util.getOptions($this),
                id = $this.attr("id")
            if($panel.is(":visible")) {
                // 圆角复原
                $this
                    .css("border-bottom-left-radius", map[id]["border-bottom-left-radius"])
                    .css("border-bottom-right-radius", map[id]["border-bottom-right-radius"])
                $panel.hide("fast", options.closedHandler);
                $.isFunction(options.closingHandler) && options.closingHandler.call($this)
            }
            return $this
        },
        /**
         * 确认选择
         */
        ok: function() {
            var $this = $(this),
                $panel = util.getSelectPanel($this),
                $input = util.getInputElement($this),
                options = util.getOptions($this)
            //获取选中值
            var inputValue = ""
            $panel.find("li").each(function() {
                if($(this).hasClass(selectedClass)) {
                    inputValue += (inputValue ? options.sep : "") + util.getText(options.input || options.text, $(this).data(itemData)||{})
                }
            })
            if(inputValue) $input.val(inputValue)
            if($.isFunction(options.okHandler)) options.okHandler.call($this)
            return $this
        },
        /**
         * 加载数据
         * @returns {boolean}
         */
        load: function() {
            var $this = $(this),
                $input = util.getInputElement($this),
                options = util.getOptions($this),
                ajaxOpt = $.extend(true, {}, options);
            var value = $.trim($input.val());
            if(!value) return false;
            // 获取input参数
            ajaxOpt.data[$input.attr("name")] = value
            ajaxOpt.type = options.method,
            ajaxOpt.success = function(res) {
                // ajax加载数据成功事件
                //$.isFunction(options.success) && options.success.apply(this, arguments)
                //res = typeof res === "string" ? eval("("+res+")") : res;
                // 数据处理
                if($.isFunction(options.filterHandler)) res = options.filterHandler.call($this, res);
                if(!$.isArray(res)) {
                    if(console && console.log) console.log("The data is not array.");
                    return false;
                }

                //填充数据
                var $ul = util.getSelectPanel($this).find("ul").empty(),
                    $item = $(util.html).find("li").empty();
                for(var i in res) {
                    var text = util.getText(options.text, res[i])
                    $item.clone()
                        .attr("id", res[i][options.key]||"")
                        .attr("title", text)
                        .prepend(text)
                        .click(function() {
                            if(options.multi) {
                                //多选
                                $(this).hasClass(selectedClass) ? $(this).removeClass(selectedClass) : $(this).addClass(selectedClass)
                            } else {
                                //单选
                                $(this).siblings().removeClass(selectedClass)
                                    .end().addClass(selectedClass)
                                //关闭面板
                                methods.close.call($this);
                                //确认选择
                                methods.ok.call($this)
                            }
                        })
                        .data(itemData, res[i])
                        .appendTo($ul)
                }
                //显示
                methods.show.call($this)
            }
            $.ajax(ajaxOpt)
            // 使用mtime.ext.js中的getx和request方法来发起ajax请求
            // $.getx(ajaxOpt.url, ajaxOpt.data, ajaxOpt.success, ajaxOpt)
        },

        // 组件初始化
        _init: function(options) {
            var $this = $(this),
                $input = util.getInputElement($this),
                defaults = $[a].defaults

            //生成id
            var id = $.trim($this.attr("id"));
            if(!id) {
                id = String(Math.random()).substring(2, 8)
                $this.attr("id", id);
            }

            var attrpre = $.trim($this.attr("sw_autocomplete_attrpre"));//属性配置前缀

            // 初始化属性配置项，属性配置项优先级低于运行时配置项
            options = $.extend(true, {}, defaults, (function() {
                var attrs = {}, attr;
                for(var i in defaults) {
                    var an = attrpre ? (attrpre + "_" + i) : i;
                    if(typeof defaults[i] === "string") {
                        if((attr = $this.attr(an)) != u) attrs[i] = attr;
                    } else if(typeof defaults[i] === "number") {
                        if(!isNaN(attr = Number($this.attr(an)))) attrs = attr;
                    } else if(typeof defaults[i] === "boolean") {
                        if(/^(true|false)$/ig.test($this.attr(an))) attrs[i] = Boolean(RegExp.$1);
                    }
                }
                return attrs;
            })(), options||{})


            // 保存相关数据
            map[id] = {
                "border-top-left-radius": $this.css("border-top-left-radius") || 0,
                "border-top-right-radius": $this.css("border-top-right-radius") || 0,
                "border-bottom-left-radius": $this.css("border-bottom-left-radius") || 0,
                "border-bottom-right-radius": $this.css("border-bottom-right-radius") || 0,
                "options": options
            }

            // UI初始化
            $input.attr("autocomplete", "off")    //关闭默认的自动完成
            $this
                .parent()
                    .css({position: "relative"})    //父级元素设置定位

            // 加载数据事件绑定
            $input
                .on(options.trigger, function() {   // 自动完成事件
                    if(options._tid) {
                        clearTimeout(options._tid)  //如果已经设置了定时器则清除前一次设置
                        options._tid = u;
                    }
                    options._tid = setTimeout(function() {
                        // 加载数据
                        methods.load.call($this)
                        // 显示数据
                        options._tid = u;   //定时器调用完成后清除定时器
                    }, options.delay);
                })

            // 键盘事件
            $input.on("keydown", function(e) {
                e = w.event || e;
                if(!e) return ;
                var $panel = util.getSelectPanel($this),
                    $li = $("li", $panel),
                    length = $li.length,
                    className = options.multi ? focusClass : selectedClass,
                    index = $("li."+ className, $panel).index();
                switch (e.keyCode) {
                    case 38:    // 上
                        $li.removeClass(className).eq(index <= 0 ? (length - 1) : (index - 1)).addClass(className)
                        break;
                    case 40:    // 下
                        $li.removeClass(className).eq(index >= (length - 1) ? 0 : (index + 1)).addClass(className)
                        break;
                    case 13:    // 回车
                        if(options.multi) {
                            // 多选模式下回车选择/取消选择
                            var $cur = $li.eq(index)
                            if($cur.hasClass(selectedClass)) {
                                $cur.removeClass(selectedClass)
                            } else {
                                $cur.addClass(selectedClass)
                            }
                        } else {
                            // 单选模式下回车确认选择
                            methods.ok.call($this)
                        }
                        break;
                }
            })

            // 确定按钮事件
            util.getSelectPanel($this).on("click", ".btnOk", function() {
                methods.close.call($this)
                methods.ok.call($this);
            })

            /**
             * 点击面板和input之外的元素时关闭面板
             */
            $(d||w).on("click", function(e) {
                e = window.event || e;
                var $list = util.getSelectPanel($this),
                    $target = $(e.target)
                if(!$target.is($this)
                    && !$target.is($list)
                    && !$target.is($("*", $list))) {
                    methods.close.call($this)
                }
            })
            /**
             * 当窗体大小改变时，调整列表面板宽度
             */
            $(w).on("resize", function() {
                util.resize($this)
            })


            return $this;
        }
    }

    // 可以特殊定制的代码
    var util = {
        // 列表面板html模板
        html: '<div class="sw_ac_panel">\
                    <ul>\
                        <li><a href="#"></a></li>\
                    </ul>\
                    <div>\
                        <a href="javascript:;" class="btnOk">确定</a>\
                    </div>\
                </div>',
        // 样式
        css: '<style type="text/css">\
                .sw_ac_panel { \
                    position: absolute; \
                    display: none; \
                    z-index: 999; \
                    background-color: #fafafa; \
                    border: 1px #ccc solid; \
                }\
                .sw_ac_panel ul {\
                    background-color: #fff;\
                    padding: 0;\
                    margin: 0;\
                }\
                .sw_ac_panel ul > li {\
                    padding: 0 11px;\
                    list-style: none;\
                    height: 26px;\
                    line-height: 26px;\
                    white-space:nowrap;\
                    -o-text-overflow:ellipsis;\
                    overflow:hidden;\
                    text-overflow:ellipsis; \
                }\
                .sw_ac_panel ul > li.sw_ac_selected {\
                    background-color: #bbb;\
                }\
                .sw_ac_panel ul > li:hover {\
                    cursor: pointer;\
                }\
                .sw_ac_panel ul > li.sw_ac_focus.sw_ac_selected {\
                    background-color: #999;\
                }\
                .swac_panel ul > li:not(.swac_selected):hover, .swac_panel ul > li:not(.swac_selected).swac_focus {\
                    background-color: #eee;\
                }\
                .swac_panel ul > li:hover > a {\
                    display: block;\
                    z-index: 1000;\
                }\
                .swac_panel ul > li > a {\
                    float: right;\
                    text-decoration: underline;\
                    color: #999;\
                    font-size: 14px;\
                    display: none;\
                }\
                .swac_panel > div {\
                    height: 26px;\
                }\
                .swac_panel > div > a {\
                    float: right;\
                    text-decoration: underline;\
                    color: #999;\
                    font-size: 14px;\
                    margin: 3px 5px;\
                }\
                </style>',
        /**
         * 获取input输入框
         * @param $this
         * @returns {*|jQuery|HTMLElement}
         */
        getInputElement: function ($this) {
            if($this.is(":text[name]"))
                return $this;
            else
                return $this.find(":text[name]")
        },
        /**
         * 获取配置项
         * @param $this
         * @returns {*}
         */
        getOptions: function($this) {
            return map[$this.attr("id")].options||{}
        },
        /**
         * 将模板字符串替换为真实值
         * @param tmpl
         * @param obj
         */
        getText: function(tmpl, obj) {
            var reg = /\{[$_a-zA-Z]{1}[$_a-zA-Z1-9]*\}/ig;
            if(reg.test(tmpl)) {
                for(var j in obj) {
                    tmpl = tmpl.replace(new RegExp("\{"+j+"\}", "g"), obj[j] == u ? "" : obj[j]);
                }
                tmpl = tmpl.replace(reg, "");
            } else {
                tmpl = obj[tmpl]||""
            }
            return tmpl;
        },
        /**
         * 获取对应的列表面板
         * @param $this
         * @returns {*|jQuery|HTMLElement}
         * @private
         */
        getSelectPanel: function($this) {
            var id = $this.attr("id"),
                options = util.getOptions($this),
                panelId = $this.attr("id") + "_auto_complete_list",
                $panel = $("#" + panelId)
            if($panel[0]) return $panel;
            $panel = $(util.html)
                .attr("id", panelId)
                .width($this.innerWidth())  //设置宽度
                .insertAfter($this)
            $("ul", $panel).empty();//清空列表
            !options.multi && $("div", $panel).remove()//单选模式不需要按钮
            // 面板圆角
            $panel.css({
                "border-bottom-left-radius": map[id]["border-top-left-radius"],
                "border-bottom-right-radius": map[id]["border-top-right-radius"]
            })
            return $panel;
        },
        /**
         * 改变尺寸
         * @param $this
         */
        resize: function($this) {
            return util.getSelectPanel($this).width($this.innerWidth())
        },
        /**
         * 加载面板样式
         */
        loadStyle: function() {
            var styleId = "swac_style";
            if($("style#"+styleId)[0]) return ;
            var style = d.createElement("style");
            style.type = "text/css";
            style.id = styleId;
            if (style.styleSheet) { //for ie
                style.styleSheet.cssText = $(util.css).html();
            } else {//for w3c
                style.appendChild(document.createTextNode($(util.css).html()));
            }
            (d.head || d.body).appendChild(style);
        },
    }

    $[a] = {
        // 组件默认配置
        defaults: {
            swautocomplete_attrpre: "",    //属性配置前缀
            multi: false,   //是否多选
            trigger: "input propertychange",  //触发时机
            sep: ",",       //多选时 input中各个值的分隔符
            delay: 800,     //触发延迟：毫秒
            key: "id",   //值字段
            text: "{text}", //作为显示文本的字段，支持自定义规则，使用{fieldName}作为占位符
            input: "",      //选择后显示到文本框中的字段，默认与text相同，支持自定义规则
            //ajax配置
            url: "",          //加载数据地址
            async: true,    //是否异步加载数据
            data:{},        //加载数据的参数，支持类型：{}、function、serialize string
            dataType:"json",
            method:"get",
            //timeout:3000,
            //success: null,
            // 回调函数
            filterHandler: null,    //数据过滤，将返回的数据进行处理，返回需要展示的列表数据
            closingHandler: null,   //面板正在关闭事件
            closedHandler: null,    //面板关闭完成事件
            showingHandler: null,   //面板正在展开事件
            showedHandler: null,    //面板展开完成事件
            okHandler: null         //选择完成事件
        }
    }

    // 插件方法
    $.fn[a] = function(options) {
        var $this = $(this),
            $input = util.getInputElement($this)
        if(!$this[0]) return $this;
        if(!$input[0]) $.error("The element must be or contain input[type=text] element with attribute [name]")
        //加载样式
        util.loadStyle();
        // 插件调用
        if(typeof options === "string" && options.charAt(0) != "_" && methods[options]) {
            return methods[options].apply($this, Array.prototype.slice.call(arguments, 1));
        } else if($.isPlainObject(options) || !options) {
            return methods._init.call($this, options);
        } else {
            $.error("The method ["+options+"] does not exist in " + component.name + ".");
        }
    }

    $(function() {
        /**
         * 自动调用
         */
        $("[sw_autocomplete=true]")[a]();
    })

})(window, document, "jQuery", "sw_autocomplete")