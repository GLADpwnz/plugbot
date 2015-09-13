glax = function(text){$c=$('#chatline');$c.val(text+$c.val());$c.focus();};
$('#messagebuffer').on('click','.username',function(){glax($(this).text());})
                   .on('click','.action, .poll-notify',function(){glax($(this).text().split(' ')[0]+": ");})
$('#userlist').on('click','span',function(){glax($(this).text()+": ");}); 

