var chartData = {
    "dateFrom" : $("#date_from").val(),
    "dateEnd" : $("#date_to").val(),
    "value" : {},
    "array" : []
};
var stockAllData = {};
var stockData = ["googl","amzn","fb","aapl","tcehy","baba"];
function filterData(code,array) {
    var str = "";
    var dateFrom = $("#date_from").val();
    var dateTo = $("#date_to").val();
    var begin = {};
    var end = {};
    for (var i = 0; i < array.length;i++) {
        var temp = array[i];
        //console.log(code, JSON.stringify(temp));
        if (dateFrom == temp.d) {
            begin = temp;
        }
        if (dateTo == temp.d) {
            end = temp;
        }
    }
    // store data
    stockAllData[code] = array;
    var beginStr = begin.d ? (begin.d + " " + begin.h) : dateFrom + " 休市日";
    var endStr = end.d ? (end.d + " " + end.h) : dateTo + " 休市日";
    var rate = "";
    if (begin.d && end.d) {
        rate = ((end.h-begin.h)*100/begin.h).toFixed(2);
        chartData["value"][code] = rate;
        var temp = {};
        temp[code] = rate;
        chartData["array"].push(temp);
        //console.log(JSON.stringify(chartData));
    }
    //var all = beginStr + "<br>" + endStr + "<br>" + rate;

    //$("#data_container").html(all);
    $("#query_btn").removeClass("query_loading");
}

/**
 * query stock history data
 * @param stockCode
 */
function queryData(stockCode) {
    $.ajax({
        type: 'GET',
        url: "http://stock.finance.sina.com.cn/usstock/api/jsonp_v2.php/var%20backData=/US_MinKService.getDailyK?symbol=" + stockCode,
        dataType: 'jsonp',
        success: function(data) {
            // do what you want
        },
        error: function(xhr, errorType, error) {
            filterData(stockCode,backData);
        }
    });
}
/**
 * display the chart
 * @param data
 */
function chartInit(data) {
    //console.log(JSON.stringify(data));
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('chart'));
    var xArray = ["Google","Amazon","Facebook","Apple","Tencent","Alibaba"];
    var wid = $(window).width();
    if (wid < 960) {
        //xArray = ["谷歌","亚马逊","脸书","苹果","腾讯","阿里"];
    }
    console.log(wid);
    // 指定图表的配置项和数据
    var option = {
        title: {
            text: 'GAFATA 增长对比(比率：%)',
            subtext: 'gafata.com',
            sublink: 'http://www.gafata.com'
        },
        tooltip: {},
        legend: {
            data:['增长比例']
        },
        xAxis: {
            data: xArray
        },
        yAxis: {},
        series: [{
            name: '销量',
            type: 'bar',
            label: {
                normal: {
                    show: true,
                    position: 'top'
                }
            },
            data: data
        }]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}
// chart first time
function firstChart() {
    var time = {"begin": "2017-01-03","end":"2017-11-06"};
    //now day
    var myDate = new Date();
    var y = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
    var m = myDate.getMonth() + 1;       //获取当前月份(0-11,0代表1月)
    var d = myDate.getDate();        //获取当前日(1-31)
    var w = myDate.getDay();         //获取当前星期X(0-6,0代表星期天)
    if (w == 0) {
        d = d - 2;
    }
    if (w == 6) {
        d = d - 1;
    }
    var nowD = y + "-" + ((m + "").length ==1 ? "0" + m : m) + "-" + ((d + "").length == 1 ? "0" + d : d);
    time["end"] = nowD;

    $("#date_from").val(time.begin);
    $("#date_to").val(time.end);
    $("#query_btn").click();
}
/**
 * quick search
 */
function clearQuick() {
    $(".search_item").removeClass("search_item_active")
}
function quickSearch(obj,days) {
    var str = "";
    var dateFrom = $("#date_from").val();
    var dateTo = $("#date_to").val();
    var begin = {};
    var end = {};
    clearQuick();
    $(obj).addClass("search_item_active");

    //iterator the all Data
    for (var code in stockAllData) {
        var item = stockAllData[code];
        var cutArray = item.slice(item.length - days);
        console.log(cutArray);
        var begin = cutArray[0];
        var end = cutArray[cutArray.length - 1];

        var rate = "";
        if (begin.d && end.d) {
            rate = ((end.h-begin.h)*100/begin.h).toFixed(2);
            chartData["value"][code] = rate;
            var temp = {};
            temp[code] = rate;
            chartData["array"].push(temp);
        }
    }
    // display chart
    var data = [];
    for (var i = 0; i < stockData.length; i++) {
        data.push(chartData["value"][stockData[i]]);
    }

    chartInit(data);
}
function anchorFunc(obj,id) {
    var hei = $("#" + id).offset().top - 80;
    $('html,body').animate({scrollTop: hei + 'px'}, 400);
    //ga('send', 'event', 'home', 'buy');
}

$(document).ready(function() {
    //执行一个laydate实例
    laydate.render({
        elem: '#date_from' //指定元素
    });
    laydate.render({
        elem: '#date_to' //指定元素
    });

    $("#query_btn").bind("click", function() {
        if ($("#query_btn").hasClass("query_loading")) {
            return false;
        }
        $("#query_btn").addClass("query_loading");
        // clear
        chartData["array"] = [];

        for (var i = 0; i < stockData.length; i++) {
            queryData(stockData[i]);
        }
        var flag = setInterval(function() {
            if (chartData["array"].length == 6) {
                // chart init
                var data = [];
                for (var i = 0; i < stockData.length; i++) {
                    data.push(chartData["value"][stockData[i]]);
                }
                chartInit(data);
                clearInterval(flag);
            }
        },200);

    })
    // chart first time load
    firstChart();
    // bind menu
    $(".nav_items_mb_btn").bind("click", function(event) {
        if ($(".nav_item_mb_container").hasClass("nav_item_mb_container_active")) {
            $(".nav_item_mb_container").removeClass("nav_item_mb_container_active");
        } else {
            $(".nav_item_mb_container").addClass("nav_item_mb_container_active");
        }
        event.preventDefault();
        event.stopPropagation();
        return false;
    });
    $("body").bind("click", function() {
        $(".nav_item_mb_container").removeClass("nav_item_mb_container_active");
    })

});