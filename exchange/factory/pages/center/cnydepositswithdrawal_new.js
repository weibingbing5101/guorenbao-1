require(['api_mkt','mkt_info','cookie'], function(api_mkt,mkt_info) {
	//console.log(api_mkt);
	//console.log(mkt_info);
	//mkt_pagehead.get();
        $('.rmbxh').on('click',function(){
            $(this).addClass('bottomon');
            $('.rmbtx').removeClass('bottomon');
            $('.recharge').show();
            $('.withdraw_deposit').hide();
        });
        $('.rmbtx').on('click',function(){
            $(this).addClass('bottomon');
            $('.rmbxh').removeClass('bottomon');
            $('.recharge').hide();
            $('.withdraw_deposit').show();
        });

        var flag;
        $('.messagenum_area').on("click",function(){
            if(flag){
                flag = false;
                $(this).css("background-color","#ffffff");
                $(".popup_message_box").show("100");
                $(".messagenum_area em").css("color","#333333");
                $(".msg_num").css("color","#333333");
            } else {
                flag = true;
                $(this).css("background-color","#282828");
                $(".popup_message_box").hide("100");
                $(".messagenum_area em").css("color","#cccccc");
                $(".msg_num").css("color","#cccccc");
            }
        });

        //接口 人民币充值历史（查询最近5条）
        api_mkt.rmbRechargeHistory({
            'pageNo':1,
            'pageSize':5
        },function(data) {
            //alert(data.msg);
            if (data.status == 200) {
                console.log(data);
                var html = [];
                for(var i=0; i<5;i++){
                    html.push("<tr>");                                        
                    html.push("<td>"+ data.data.list[i].updateDate +"</td>");
                    html.push("<td>"+ data.data.list[i].bank +"</td>");
                    html.push("<td>"+ data.data.list[i].money +"</td>");
                    html.push("<td class='status'>"+ data.data.list[i].status +"</td>");
                    html.push("<td class='checkDeal'>查看此笔充值单</td>");
                    html.push("</tr>");
                    $(".cnyInput").html("");  //添加前清空 
                    $(".cnyInput").append(html.join(""));

                    //过滤内容显示不同颜色
                    $(".status").filter(":contains('进行中')").css("color","orange");
                    $(".status").filter(":contains('已完成')").css("color","#ccc");
                }
            }else{
                console.log('财务中心-人民币充值历史表格，加载失败。');
            }
        });

        //接口 人民币充值历史（带分页）
        $(".moreCheck").click(function(){
            api_mkt.rmbRechargeHistory({
                'pageNo':1,
                'pageSize':10
            },function(data) {
                //alert(data.msg);
                if (data.status == 200) {
                    console.log(data);
                    var html = [];
                    for(var i=0; i<10;i++){
                        html.push("<tr>");                                        
                        html.push("<td>"+ data.data.list[i].updateDate +"</td>");
                        html.push("<td>"+ data.data.list[i].bank +"</td>");
                        html.push("<td>"+ data.data.list[i].money +"</td>");
                        html.push("<td class='status'>"+ data.data.list[i].status +"</td>");
                        html.push("<td class='checkDeal'>查看此笔充值单</td>");
                        html.push("</tr>");
                        $(".cnyInput").html("");  //添加前清空 
                        $(".cnyInput").append(html.join(""));

                        //过滤内容显示不同颜色
                        $(".status").filter(":contains('进行中')").css("color","orange");
                        $(".status").filter(":contains('已完成')").css("color","#ccc");
                    }
                }else{
                    console.log('财务中心-人民币充值历史表格，加载失败。');
                }
            });
        });

        //人民币提现表单校验
        $('#WithdrawalsAmount').blur(function(){
            var WithdrawalsAmount = $(this).val();
            if(!WithdrawalsAmount || isNaN(WithdrawalsAmount)){
                $('.msg-WithdrawalsAmount').text('请输入提现金额');
                flag = false;
            }else if(WithdrawalsAmount > 50000){
                $('.msg-WithdrawalsAmount').text('最大提现金额不能超过50000');
                flag = false;
            }else{
                flag = true;
                $('.msg-WithdrawalsAmount').text('');
                //手续费校验
                var Fee =$('.WithdrawalsFee');
                if(WithdrawalsAmount >= 400 ){
                    Fee.text(WithdrawalsAmount*0.005+' CNY');                    
                }else{
                    Fee.text('2 CNY');
                }
            }
        });
        //支付密码
        $('#WithdrawalsPayPwd').blur(function(){
            var pwd = $(this).val();
            if(!pwd){
                $('.msg-WithdrawalsPayPwd').text('请输入支付密码');
                flag = false;
            }else{
                flag = true;
                $('.msg-WithdrawalsPayPwd').text('');
            }
        });
        //验证码
        $('#VerificationCode').blur(function(){
            var pwd = $(this).val();
            var reg = /^\d{6}$/;
            if(!reg.exec(pwd)){
                $('.msg-VerificationCode').text('请输入验证码');
                flag = false;
            }else{
                flag = true;
                $('.msg-VerificationCode').text('');
            }
        });

        //获取验证码-人民币提现
        $('#VerificationCodeBtn').click(function(){
            if(flag == false || typeof(flag) == 'undefined'){
                alert('请完善填写信息！');
            }
            else{
                api_mkt.sendCodeByLoginAfter( function(data) {
                    if (data.status == 200) {
                        console.log(data);
                    } else {   
                    }
                });
                
                //30秒内只能发送一次
                var count = 30;
                var resend = setInterval(function(){
                        count--;
                        if(count > 0){
                            $('#VerificationCodeBtn').val(count+'s后重新发送');
                            $('#VerificationCodeBtn').attr('disabled',true).css('cursor','not-allowed');
                        }else{
                            clearInterval(resend);
                            $('#VerificationCodeBtn').attr('disabled',false).css('cursor','pointer').val('获取验证码');
                        }
                    },1000); 
            }
            
        }); 
        //判断是否添加银行卡
        api_mkt.bankList({  
            'pageNo':1,
            'pageSize' :10   
        }, function(data) {
            if (data.status == 200) {
                console.log(data);
                console.log(data.data.list[0].acnumber);
                var num = data.data.list[0].acnumber;
                var node = $('<div></div>');
                var nodeList ='<input type="radio" name="checkBankCard" class="checkBankCard" checked/>'+'<div class="bankIdCard"></div>';
                node.html(nodeList);
                node.insertBefore($('.addBankCard'));
                $('.bankIdCard').text('尾号：'+num.substr(num.length-4));
                //判断显示银行logo
                var bankName = new String(data.data.list[0].bank);
                if(bankName == '中国工商银行'){
                    $('.bankIdCard').addClass('ICBC');
                }else if(bankName == '中国建设银行'){
                    $('.bankIdCard').addClass('CBC');
                }else if(bankName == '交通银行'){
                    $('.bankIdCard').addClass('BC');
                }else if(bankName == '招商银行'){
                    $('.bankIdCard').addClass('CMB');
                }else if(bankName == '中国邮政储蓄银行'){
                    $('.bankIdCard').addClass('PSBC');
                }else if(bankName == '中国农业银行'){
                    $('.bankIdCard').addClass('ABC');
                }

                //人民币提现申请 弹出层        
                $(".Withdrawalsbtn").click(function(){
                    if(flag == false || typeof(flag) == 'undefined'){
                        alert('请完成填写相关信息！');
                    }else{
                        //打开弹出层-生成汇款单
                        $(".mydiv1").css("display","block");
                        $(".bg").css("display","block");               
                        
                        $(".WithdrawalsCard").text(data.data.list[0].acnumber);
                        $(".WithdrawalsBank").text(data.data.list[0].bank);
                        $(".WithdrawalsName").text(data.data.list[0].name);
                        var amount = parseInt($("#WithdrawalsAmount").val());
                        var Fee = parseInt($('.WithdrawalsFee').text());
                        $(".WithdrawalsAmount").text(amount+'.00');
                        $(".WithdrawalsRealAmount").text((amount - Fee)+'.00');

                        //关闭弹出层 -生成汇款单
                        $(".span-text1").click(function(){
                            $(".mydiv1").css("display","none");
                            $(".bg").css("display","none");
                        });   

                        //接口：人民币提现
                        api_mkt.rmbWithdrawals({          
                            'bankId':data.data.list[0].acnumber,
                            'money':amount,
                            'identifyingCode':$('#VerificationCode').val(),
                            'fee':Fee,
                            'bankName':data.data.list[0].bank,
                            'acName':data.data.list[0].name,
                            'paypwd':$('#WithdrawalsPayPwd').val() 
                        }, function(data) {
                            if (data.status == 200) {
                                console.log(data);
                            } else {
                                console.log('err');
                            }
                        });         
                    }
                });
            } else {
                console.log('err');
            }
        });

        //接口 人民币充提现（查询最近5条）
        api_mkt.rmbWithdrawals({
            'pageNo':1,
            'pageSize':5
        },function(data) {
            //alert('提现查询5条');
            if (data.status == 200) {
                console.log(data);
                var html = [];
                for(var i=0; i<5;i++){
                    html.push("<tr>");                                        
                    html.push("<td>"+ data.data.list[i].updateDate +"</td>");
                    html.push("<td>"+ data.data.list[i].bank +"</td>");
                    html.push("<td>"+ data.data.list[i].pay +"</td>");
                    html.push("<td>"+ data.data.list[i].money-pay +"</td>");
                    html.push("<td class='cnyWithdrawals'>"+ data.data.list[i].status+ "</td>");
                    html.push("</tr>");
                    $(".cnyOutput").html("");  //添加前清空 
                    $(".cnyOutput").append(html.join(""));

                    //过滤内容显示不同颜色
                    $(".cnyWithdrawals").filter(":contains('进行中')").css("color","orange");
                }
            }else {
                console.log('财务中心-人民币提现历史表格带分页，加载失败。');
            }
        });

        //接口 人民币充提现（带分页）
        $(".moreCheck").click(function(){
            api_mkt.rmbWithdrawalsHistory({
                'pageNo':1,
                'pageSize':5
            },function(data) {
                //alert(data.msg);
                if (data.status == 200) {
                    console.log(data);
                    var html = [];
                    for(var i=0; i<10;i++){
                        html.push("<tr>");                                        
                        html.push("<td>"+ data.data.list[i].updateDate +"</td>");
                        html.push("<td>"+ data.data.list[i].bank +"</td>");
                        html.push("<td>"+ data.data.list[i].pay +"</td>");
                        html.push("<td>"+ data.data.list[i].money-pay +"</td>");
                        html.push("<td class='cnyWithdrawals'>"+ data.data.list[i].status+ "</td>");
                        html.push("</tr>");
                        $(".cnyOutput").html("");  //添加前清空 
                        $(".cnyOutput").append(html.join(""));

                        //过滤内容显示不同颜色
                        $(".cnyWithdrawals").filter(":contains('进行中')").css("color","orange"); 
                    }
                }else {
                    console.log('财务中心-人民币提现历史表格带分页，加载失败。');
                }
            });
        });

        //实名认证用户充值-显示/隐藏-提示文本内容
        $(".accountholder_tip").hover(function(){
            $(".tipscontent").toggle();
        });

        //生成汇款单校验
        //开户人姓名校验
        var btnConfirm;
        $("#bank-username").blur(function(){
            var username = $("#bank-username").val();
            if(!username){
                btnConfirm = false;
                $('.msg-bank-username').show().text('请输入正确开户人姓名');
            }else{
                $('.msg-bank-username').hide();
                btnConfirm = true;
            }
        });
        //充值金额校验
        $("#bank-money").blur(function(){
            var bankmoney = $("#bank-money").val();
            if(!bankmoney || isNaN(bankmoney)){
                btnConfirm = false;
                $('.msg-bank-money').show().text('请输入正确的整数金额');
            }else{
                $('.msg-bank-money').hide();
                btnConfirm = true;
            }
        });
        //银行账号校验
        $("#bank-idcard").blur(function(){
            var bankIdcard = $("#bank-idcard").val();
            var reg = /^(\d{16}|\d{19})$/;
            if(!bankIdcard || !reg.exec(bankIdcard)){
                btnConfirm = false;
                $('.msg-bank-idcard').show().text('请输入正确的银行账号');
            }else{
                $('.msg-bank-idcard').hide();
                btnConfirm = true;
                //接口 银行卡识别
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: "http://116.213.142.89:8080/common/checkBankCard",
                    data: JSON.stringify({
                        'bankCard':$("#bank-idcard").val()
                    }),
                    cache: false,
                    success: function(data) {
                        console.log(data.data.bankName);
                        //所属银行自动添加
                        $("#bank").val(data.data.bankName);
                    },
                    error: function() {
                        console.log("提交失败");
                    }
                });

                /*api_mkt.checkBankCard({          
                        'bankCard':$("#bank-idcard").val()     
                    }, function(data) {
                        if (data.status == 200) {
                            console.log(data.bankName);
                            //所属银行自动添加
                            $("#bank").blur(function(){
                                var bank = $("#bank").val();
                                bank = data.bankName;
                            });
                        } else {
                            alert('银行卡号有误'); 
                        }
                });*/
            }
        });
        
        //手机号校验
        $("#phone").blur(function(){
            var phone = $("#phone").val();
            var reg = /^(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57])[0-9]{8}$/;
            if(!reg.test(phone) || !phone){  
                btnConfirm = false;
                $('.msg-phone').show().text('请输入手机号码');
            }else{
                $('.msg-phone').hide();
                btnConfirm = true;
            }
        });

        //生成汇款单里的填充文本        
        $(".build-remit-layer").click(function(){
            if(btnConfirm == false || typeof(btnConfirm) == 'undefined'){
                alert('请完成填写相关信息！');
            }else{
                //打开弹出层-生成汇款单
                $(".mydiv").css("display","block");
                $(".bg").css("display","block");               
                
                $(".remittance-id").text(Math.random()*10E16);
                $(".bank-card-new").text($("#bank-idcard").val());
                $(".bank-name-new").text($("#bank").val());
                $(".account-name-new").text($("#bank-username").val());
                $(".money-new").text($("#bank-money").val()+'.00');

                //关闭弹出层 -生成汇款单
                $(".span-text").click(function(){
                    $(".mydiv").css("display","none");
                    $(".bg").css("display","none");
                });  
                /*$(".remittance-note-number").text();*/  

                //接口：人民币充值
                api_mkt.rmbRecharge({          
                    'bankId':$('#bank-idcard').val(),
                    'rechargeMoney':$('#bank-money').val(),
                    'phone':$('#phone').val(),
                    "bankName":$("#bank").val()     
                }, function(data) {
                    if (data.status == 200) {
                        console.log(data);
                    } else {
                        console.log('err');
                    }
                });         
            }
        });
        
});