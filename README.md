# Web前端组件 jsunw_autocomplete
一款简单的自动完成输入框控件
# 自动完成输入框——sw_autocomplete.js

## 组件说明
    自动完成输入框基于jQuery开发，用于根据输入关键字自动搜索相关信息，显示至页面供用户选择，以达到用户快速完成输入操作的目的。

## 使用方法
1. 引入依赖脚本
```
// 具体脚本路径根据你的项目来设置
<script type="text/javascript" src="../lib/js/jquery.js"></script>
```
2. 引入自动完成输入框脚本
```
// 具体脚本路径根据你的项目来设置
<script type="text/javascript" src="../src/sw_autocomplete.js"></script>
```
3. HTML标记说明
    使用sw_autocomplete插件，HTML标记必须满足以下条件：
    * 调用元素是一个input[type=text]或者调用元素是一个包含有input[type=text]的容器元素
    * input必须包含一个name属性
    例如：
```
<!-- input[name=kw]可以作为调用元素 -->
<input name="kw">
<!-- div可以作为调用元素 -->
<div>
    <input name="test2">
</div>
```
4. 最简单的调用方法
```
<script>
// url是搜索地址，根据实际情况配置
// key是返回列表中，数据项中用来作为键的字段名称，而text则是用来作为显示文本的字段名称
$("input[name=kw]").sw_autocomplete({
    url: "data/data.json",
    key: "id",
    text: "nameCN"
})
</script>
```
5. 更多用法<br>
    sw_autocomplete插件支持更多的配置来满足大家的个性化需求：<br>
    * multi: false,   //是否多选<br>
    * trigger: "input propertychange",  //触发时机，默认input事件和propertychange事件，即输入过程中触发；配置值为jquery事件名，多个事件名请使用空格分隔<br>
    * sep: ",",       //多选时 input中各个值的分隔符<br>
    * delay: 800,     //触发延迟：毫秒<br>
    * key: "id",   //值字段<br>
    * text: "{text}", //作为显示文本的字段，支持自定义规则，使用{fieldName}作为占位符<br>
    * input: "",      //选择后显示到文本框中的字段，默认与text相同，支持自定义规则<br>
    //ajax配置，除method以外，其他的与jQuery的ajax配置相同<br>
    * url: "",          //加载数据地址<br>
    * async: true,    //是否异步加载数据<br>
    * data:{},        //加载数据的参数，支持类型：{}、function、serialize string<br>
    * dataType:"json",    //返回数据类型<br>
    * method:"get",   //由于在html属性中，type属性作为input的原生属性，为了区别ajax中的type配置，所以这里将ajax的type命名为method<br>
    // 回调函数<br>
    * filterHandler: null,    //当ajax调用成功返回后，调用此函数对返回数据进行预处理，预处理函数必须返回一个显示结果面板所需要的数组数据<br>
    * closingHandler: null,   //搜索结果面板正在关闭事件<br>
    * closedHandler: null,    //搜索结果面板关闭完成事件<br>
    * showingHandler: null,   //搜索结果面板正在展开事件<br>
    * showedHandler: null,    //搜索结果面板展开完成事件<br>
    * okHandler: null         //选择动作完成事件，即选中值显示到input中以后触发<br>
6. 更简单的使用sw_autocomplete<br>
    为了减少大家书写js代码，可以通过HTML属性来配置使用sw_autocomplete插件，属性配置只能支持（string|boolean|number）类型的配置；<br>
    参考以上配置说明，如果配置项值为（string|boolean|number）三种类型中的一种，则该配置项可以通过HTML标签属性来配置；<br>
    这里说的HTML标签属性配置是指调用元素的标签属性。<br>
    ps: 属性配置项优先级低于js中运行时指定的配置项<br>
    ps: 这也是为什么ajax的type配置要改名为method配置的原因（因为html中input的type表示文本框类型）。
```
<input name="kw" url="data/data.json" multi="true" key="id" text="nameCN" method="post" delay="1000">
<script>
    $("input[name=kw]").sw_autocomplete();
</script>
//以上代码在执行时，相当于以下代码
//<input name="kw">
//<script>
//$("input[name=kw]").sw_autocomplete({
//    multi: true,
//    url: "data/data.json",
//    key: "id",
//    delay: 1000,
//    text: "nameCN",
//    method: "post"
//})
//</script>
```
7. 更加个性化的配置<br>
    sw_autocomplete插件通过模板化text、input配置项，可以支持更加个性化的文本显示.<br>
    所谓模板化，是指自定义文本显示格式，显示数据项的某个字段使用"{字段名}"作为占位符，如果数据项中不存在该字段或该字段值为null，则会对应占位符输出空字符串
```
<input name="kw" url="data/data.json" multi="true" key="id" text="nameCN" method="post" delay="1000">
<script>
    $("input[name=kw]").sw_autocomplete({
        text: "{nameCN} - nameEN",
        input: "{id} - {nameCN} - {nameEN}"
    });
</script>
//在搜索结果面板中会根据text的规则来显示文本，在选择动作完成后，会根据input的规则来输出文本值文本框中
//ps: 如果不指定input配置，则默认与text相同
```
8. 远离JS - 自动初始化<br>
    有时候我们所有的配置都能通过标签属性来完成，但是我们还是需要依据js初始化代码，为了更方便的使用sw_autocomplete插件，我们引入了自动初始化配置sw_autocomplete，<br>
    设置标签属性sw_autocomplete=true，则在文档加载完成后，插件会自动初始化此元素，不需要再显示书写js代码来初始化。
```
<input name="kw"
    sw_autocomplete="true"
    url="data/data.json"
    multi="true"
    key="id"
    text="nameCN"
    method="post"
    delay="1000">
<!-- sw_autocomplete="true"配置隐式调用了.sw_autocomplete()方法 -->
```
9. 属性冲突解决方案<br>
    有时候页面会非常复杂，可能引入了很多其他支持属性配置的插件，为了避免引起冲突，可以设置属性配置项的前缀sw_autocomplete_attrpre，<br>
    如果该前缀不为空，则其他autocomplete的属性配置项名称都要指定为：前缀attrpre的值 + "_" + 配置项名称。例如：
```
<input name="kw"
    sw_autocomplete="true"
    sw_autocomplete_attrpre="sw"
    sw_url="data/data.json"
    sw_multi="true"
    sw_key="id"
    sw_text="nameCN"
    sw_method="post"
    sw_delay="1000">
<!-- sw_autocomplete="true"配置隐式调用了.sw_autocomplete()方法 -->
```