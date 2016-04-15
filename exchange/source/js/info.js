﻿define('mkt_info', ['api_mkt','decimal'], function(api_mkt,decimal) {
    var price = {
        interval: 1000,
        timer: null,
        stop: function() {
            clearTimeout(price.timer);
        },
        onChange: updateprice,
        onChange2: $.noop
    };
    var once = price.once = function(callback) {
        api_mkt.pollinfo(function(data) {
            callback && callback(data);
        });
    };

    var getTwoPs = function(str){
		var length = 0;
    	var position = 0;
    	//String str = bd.toPlainString();
    	if(String(str).indexOf(".") < 0){
    		return str+".00";
    	}
    	length = str.length;
    	position = String(str).indexOf(".");
    	if(length < position + 3){
    		return str + "0";
    	}else{
    		return String(str).substring(0, position + 3);
    	}
	}
    //首页+交易大厅的价格轮询
    var updateprice = function(haha) {
        var thelatestprice;
        var thelatestprice_second;
        if (haha['order']) {
            thelatestprice = JSON.parse(haha['order'][0]).price;
            //console.log("xxxxxxxxxx"+thelatestprice);
            thelatestprice = getTwoPs(thelatestprice);
            //console.log("yyyyyyyyyy"+getTwoPs(thelatestprice));
            $('#thelatestprice').html(thelatestprice); //页面顶部 最新成交价
            thelatestprice_second = JSON.parse(haha['order'][1]).price;
        }
        // thelatestprice = 4;
        // thelatestprice_second = 1;
        var turnover = Number(haha['24Total']).toFixed(2);
        $('#turnover').html(turnover); //页面顶部 24小时成交量
        $('#thelatestprice_floor').html(thelatestprice); //交易大厅 最新成交价
        $('#thelatestprice_em').html(thelatestprice); //首页轮播图下面最新成交价
        if (thelatestprice != "" && thelatestprice_second == "") {}
        console.log("thelatestprice"+thelatestprice);
        console.log("thelatestprice_second"+thelatestprice_second);
        if (thelatestprice != "" && thelatestprice_second != "") {
            if (thelatestprice > thelatestprice_second) {
            	console.log("红色");
                $(".quoted_price_first").css("color", "#dd0900"); //红色
                $("#thelatestprice_em")[0] ? $("#thelatestprice_em")[0].style.backgroundImage = "url(./images/index_arrow_rise.png)" : "";
                // console.log("aaaaaa");
                $(".new_color").css("color", "#dd0900");
                $("#thelatestprice_floor")[0] ? $("#thelatestprice_floor")[0].style.backgroundImage = "url(./images/floor_arrow_rise.png)" : "";
            }
            if (thelatestprice < thelatestprice_second) {
            	console.log("蓝色");
                $(".quoted_price_first").css("color", "#00951c"); //蓝色
                $("#thelatestprice_em")[0] ? $("#thelatestprice_em")[0].style.backgroundImage = "url(./images/index_big_down.png)" : "";
                // console.log("bbbbbb");
                $(".new_color").css("color", "#00951c");
                $("#thelatestprice_floor")[0] ? $("#thelatestprice_floor")[0].style.backgroundImage = "url(./images/floor_big_down.png)" : "";
            }
        }
        var low24 = Number(haha['24low']); //最低价
        var high24 = Number(haha['24high']); //最高价
        var price24 = Number(haha['24Price']); //24小时之前价

        $('#thehighest_price').html(high24.toFixed(2)); //首页 最高价
        $('#thelowest_price').html(low24.toFixed(2)); //首页 最低价
        $('#thehighest_price_floor').html(high24.toFixed(2)); //交易大厅 最高价
        $('#thelowest_price_floor').html(low24.toFixed(2)); //交易大厅 最低价
        var total = Number(haha['total']);

        console.log("thelatestprice==========="+thelatestprice);
        console.log("price24============"+price24);

        // price24 = 2;  //最新成交价*(1+x) = 24小时之前价格
        // thelatestprice = 1.2;
        var unknow = Number((thelatestprice - price24)/price24);
        // console.log("price24"+price24);
        // console.log("thelatestprice"+thelatestprice);
        // console.log("unknow"+unknow);
        $('#cumulativevolumeem').html(total.toFixed(2)); //首页 累计成交量
        $('#thecumulativevolume_floor').html(total.toFixed(2)); //交易大厅 累计成交量
        $('#pricechangeratioem_updown').html((unknow * 100).toFixed(2) + "%"); //涨跌幅
        if (unknow < 0) {
            $("#pricechangeratio").css("color", "#00951c");
            $("#pricechangeratioem_updown")[0] ? $("#pricechangeratioem_updown")[0].style.backgroundImage = "url(./images/index_arrow_down.png)" : "";
        } else {
            $("#pricechangeratio").css("color", "#dd0900");
            $("#pricechangeratioem_updown")[0] ? $("#pricechangeratioem_updown")[0].style.backgroundImage = "url(./images/index_sma_top.png)" : "";
        }
        var bid_history_list_html = "";
        var orderlist = haha['order'];
        if (orderlist != null) {
            for (var i = 0; i < orderlist.length; i++) {
                var orderliststr = JSON.parse(orderlist[i]);
                var timestr = orderliststr.time;
                var buyorsell = orderliststr.type;
                if (buyorsell == "BUY") {
                    buyorsell = "买入";
                    sell_color = "buy_color";
                }
                if (buyorsell == "SELL") {
                    buyorsell = "卖出";
                    sell_color = "sell_color";
                }
                bid_history_list_html += "<div class='table_row'>" +
                    "<div class='table_con'>" + timestr + "</div><div class='table_con " + sell_color + "'>" + buyorsell + "</div>" +
                    "<div class='table_con'>" + orderliststr.price + "</div><div class='table_con'>" + orderliststr.num + "</div>" +
                    "</div>";
            }
        }
        $("#table_three").html(bid_history_list_html);
    }
    var get = price.get = function() {
        once(function(next) {
            updateprice(next);
            price.onChange2();
            price.timer = setTimeout(price.get, price.interval);
        });
    };
    return price;
});
