require(['api_mkt', 'mkt_info', 'mkt_pagehead', 'cookie','decimal'], function(api_mkt, mkt_info,decimal) {
    //console.log(api_mkt);
    //console.log(mkt_info);
    //mkt_info.get();
    //mkt_pagehead.get();
    $('.rmbxh').on('click', function() {
        $(this).addClass('bottomon');
        $('.rmbtx').removeClass('bottomon');
        $('.recharge').show();
        $('.withdraw_deposit').hide();
    });
    $('.rmbtx').on('click', function() {
        $(this).addClass('bottomon');
        $('.rmbxh').removeClass('bottomon');
        $('.recharge').hide();
        $('.withdraw_deposit').show();
    });
    //点击进入tab的指定位置
    $('#addNewAd').click(function() {
        location.href = "withdraw.html?id=rmbtx ";
    });
    //我的账户信息-取账户地址
    api_mkt.basic(function(data) {
        if (data.status == 200) {
            //创建节点
            $('.regist_rg_input-longAddress').val(data.data.list.gOPAddress);
            $('.gpal_address').text(data.data.list.gOPAddress);
        } else {
            //console.log(err);
        }
    });

    //果仁提现地址管理(如果有就显示)
    api_mkt.gopAddressMan({
        'pageNo': 1,
        'pageSize': 10
    }, function(data) {
        if (data.status == 200) {
            console.log(data);
            for (var i = 0; i < data.data.list.length; i++) {
                //创建节点
                var Node1 = $('<option></option>');
                Node1.text(data.data.list[i].name);
                Node1.val(data.data.list[i].address);
                $('.regist_rg_input-select').append(Node1);

                $('option:eq(1)').attr('selected',true);
            }
        } else {
            //console.log(err);
        }
    });

    //果仁(提现)转出记录_只查询成功记录
    api_mkt.transferOutHistory({
        'pageNo': 1,
        'pageSize': 5
    }, function(data) {
        if (data.status == 200) {
            var html = [];
            var num = data.data.list.length < 5?data.data.list.length:5;
            for(var i=0; i<num;i++){
                html.push("<tr>");
                html.push("<td>" + data.data.list[i].createDate + "</td>");
                html.push("<td>" + data.data.list[i].wallet + "</td>");
                html.push("<td>" + data.data.list[i].number + "</td>");
                html.push("<td class='status'>" + data.data.list[i].transferGopStatus + "</td>");
                html.push("</tr>");
                $(".guorenOutput").html(""); //添加前清空 
                $(".guorenOutput").append(html.join(""));

                //过滤内容显示不同颜色
                $(".status").filter(":contains('SUCCESS')").text('已到账').css("color", "#999");                
                $(".status").filter(":contains('PROCESSING')").text('进行中').css("color", "orange");
            
            }
        } else {
            
        }
    });
    //果仁提现-校验
    var btnConfirm1a = false; //校验表单-变量
    var btnConfirm2a = false; //校验表单-变量
    var btnConfirm3a = false; //校验表单-变量
    //输入数量校验
    $('#gopWithdrawalsNumber').blur(function() {
        var num = $('#gopWithdrawalsNumber').val();
        if (!num || isNaN(num)) {
            btnConfirm1a = false;
            $('.msg-gopWithdrawalsNumber').text('请输入提取数量');
        }else if(parseInt(num.length - num.lastIndexOf('.')) > 3){
            btnConfirm1a = false;
            $('.msg-gopWithdrawalsNumber').text('果仁提现转出数量最多输入两位小数');
        }else{
            btnConfirm1a = true;
            $('.msg-gopWithdrawalsNumber').text('');
        }
    });
    
    /*$(".wrapper").on("input propertychange", "#gopWithdrawalsNumber", function() {
    	var num = $(this).val();
        var oldData=$(this).attr("data-old");
        if(decimal.toDecimal(num) < 0.02||decimal.getPsercison(num)>2 ){
        	//
        	$(this).val(oldData?oldData:0.02);
            flag = false;
        }else{
        	$(this).attr("data-old",num);
        }
    });*/
    
    //校验支付密码
    $('#gopWithdrawalsPayPwd').blur(function() {
        var PayPwd = $('#gopWithdrawalsPayPwd').val();
        if (!PayPwd) {
            btnConfirm2a = false;
            $('.msg-gopWithdrawalsPayPwd').text('请输入您的支付密码');
        } else {
            btnConfirm2a = true;
            $('.msg-gopWithdrawalsPayPwd').text('');
        }
    });

    //获取验证码
    $('#gopWithdrawalsCodeBtn').click(function() {
        api_mkt.sendCodeByLoginAfter(function(data) {
            if (data.status == 200) {
                console.log(data);
            } else {}
        });

        //30秒内只能发送一次
        var count = 30;
        var resend = setInterval(function() {
            count--;
            if (count > 0) {
                $('#gopWithdrawalsCodeBtn').val(count + 's后重新发送');
                $('#gopWithdrawalsCodeBtn').attr('disabled',true).css({'cursor':'not-allowed','backgroundColor':'#eee','color':'#999'});
            } else {
                clearInterval(resend);
                $('#gopWithdrawalsCodeBtn').attr('disabled',false).css({'cursor':'not-allowed','backgroundColor':'#0bbeee','color':'#fff'}).val('获取验证码');
            }
        }, 1000);

    });
    //校验验证码
    $('#gopWithdrawalsPayPwd').blur(function() {
        var code= $('#gopWithdrawalsCode').val();
        if (!code) {
            btnConfirm3a = false;
            $('.msg-gopWithdrawalsCode').text('请输入短信验证码');
        } else {
            btnConfirm3a = true;
            $('.msg-gopWithdrawalsCode').text('');
        }
    });
    //转出
    $('.gopWithdrawalsBtn').click(function() {
        if (btnConfirm1a == false) {
            $('.msg-gopWithdrawalsNumber').text('请输入提取数量');
        } else if (btnConfirm2a == false) {
            $('.msg-gopWithdrawalsPayPwd').text('请输入您的支付密码');
        } else if (btnConfirm3a == false) {
            $('.msg-gopWithdrawalsCode').text('请输入正确的短信验证码');
        } else{
            //果仁提现
            api_mkt.gopWithdrawals({
                'number': $('#gopWithdrawalsNumber').val(),
                'toWallet': $('#gopWithdrawalsSelect').find('option:selected').val(),
                'identifyingCode': $('#gopWithdrawalsCode').val(),
                'paypwd': $('#gopWithdrawalsPayPwd').val()
            }, function(data) {
                if (data.status == 200) {
                    //$('.msg-gopWithdrawalsNumber').show().text('转出成功');
                    alert('转出成功');
                } else{                    
                    //$('.msg-gopWithdrawalsNumber').show().text('您的'+data.msg+'，转出失败');
                    /*$("#floor_bg").show();
                    $("#floor_popDiv").fadeIn(500);*/
                    alert('您的'+data.msg+'，转出失败');
                }
            });
        }
    });

    //果仁(充值)转出记录_只查询成功记录
    api_mkt.transferInHistory({
        'pageNo': 1,
        'pageSize': 10
    }, function(data) {
        if (data.status == 200) {
            var html = [];
            var num = data.data.list.length < 5?data.data.list.length:5;
            for(var i=0; i<num;i++){
                html.push("<tr>");
                html.push("<td>" + data.data.list[i].createDate + "</td>");
                html.push("<td>" + data.data.list[i].wallet + "</td>");
                html.push("<td>" + data.data.list[i].number + "</td>");
                html.push("<td class='status'>" + data.data.list[i].transferGopStatus + "</td>");
                html.push("</tr>");
                $(".guorenInput").html(""); //添加前清空 
                $(".guorenInput").append(html.join(""));

                //过滤内容显示不同颜色
                $(".status").filter(":contains('SUCCESS')").text('已到账').css("color", "#999");                
                $(".status").filter(":contains('PROCESSING')").text('进行中').css("color", "orange");
            
            }
        } else {
            
        }
    });

    

    //点击图片 复制地址
    $('.imgCopy').click(function(){
        $('#a').select();  
        document.execCommand("Copy");
        alert("已复制好，可贴粘。"); 
    });


});
