var vm_init=function(){
	$vm.start_time=new Date().getTime();
	//check and clear localstorage
	var data=''; for(var key in window.localStorage){ if(window.localStorage.hasOwnProperty(key)){ data+=window.localStorage[key]; }}
	if(data.length>3000000) localStorage.clear();
	if(window.location.href.indexOf('?clearcache=1')!=-1){
		localStorage.clear();
		alert("Cache is cleard!");
		return;
	}
	//set name space
	$VmAPI={};$vm.module_list={};$vm.config_list={}
	//--------------------------------------------------------
	//get hosting path
	var href = window.location.href.split('?')[0];
	var path=href.split('/index.html')[0];
	var lastChar=path[path.length-1];
	if(lastChar=='/') path=path.substring(0,path.length-1);
	$vm.hosting_path=path;
	if(window.location.hostname=='127.0.0.1' || window.location.hostname=='localhost')	$vm.debug =true;
	//--------------------------------------------------------
	$vm.reload='';
	if(window.location.toString().indexOf('_d=3')!=-1){
		$vm.reload=new Date().getTime().toString();
	}
	$vm.version=$vm.ver[0];
	//--------------------------------------------------------
	var load_config_and_init=function(){
		var url=$vm.hosting_path+"/index.json";
		var ver=localStorage.getItem(url+"_ver");
		var txt=localStorage.getItem(url+"_txt");
		//------------------------------------------
		if(ver!=$vm.ver[1] || txt===null || $vm.debug===true || $vm.reload!=''){
			console.log('loading '+url+'?_='+$vm.ver[1]+$vm.reload);
			$.get(url+'?_='+$vm.ver[1]+$vm.reload,function(data){
				localStorage.setItem(url+"_txt",data);
				localStorage.setItem(url+"_ver",$vm.ver[1]);
				app_init(data);;
			},'text').fail(function() {
				alert( "The configuration file ("+url+") doesn't exist!" );
			});
		}
		else{ app_init(txt); }
		//------------------------------------------
	}
	//--------------------------------------------------------
	var app_init=function(txt){
		var text=$('<div/>').html(txt).text();
		//---------------------------
		var config;
		try{ config=JSON.parse(text);}
		catch (e){ alert("Error in app config file\n"+e); return; }
		//--------------------------------------------------------
		$vm.app_config=config;
		//--------------------------------------------------------
		$vm.parts_path="https://vmiis.github.io/component";
		$vm.image_path=config.image_path;
		if(window.location.hostname=='127.0.0.1' || window.location.hostname=='localhost'){
			$vm.library_path =window.location.protocol+'//'+window.location.host;
		}
		//--------------------------------------------------------
		if(config.default_production=='No'){
			if(window.location.toString().indexOf('database=production')!=-1){
				$vm.server          ='production';
				$VmAPI.api_base     =config.api_path_production;
			}
			else if(window.location.toString().indexOf('database=woolcock')!=-1){
				$vm.server          ='production';
				$VmAPI.api_base     =config.api_path_woolcock;
			}
			else{
				$vm.server          ='development';
				$VmAPI.api_base     =config.api_path_development;
			}
		}
		else {
			if(window.location.toString().indexOf('database=development')!=-1){
				$vm.server          ='development';
				$VmAPI.api_base     =config.api_path_development;
			}
			else{
				$vm.server          ='production';
				$VmAPI.api_base     =config.api_path_production;
			}
		}
		$vm.debug_message=true; //show debug message in console
		//--------------------------------------------------------
		load_vmapi();
	}
	//--------------------------------------------------------
	//load vm framework, vm api and first module
	var load_vmapi   =function(){ load_js($vm.url('https://vmiis.github.io/api/distribution/vmapi.min.js'),load_vm);	}
	var load_vm      =function(){ load_js($vm.url('https://vmiis.github.io/framework/distribution/vmframework.min.js'),init);}
	var init         =function(){
		$vm.init_v3({callback:function(){$vm.init_status=1;}})
		$vm.load_first_module_to_body({url:'/layout/main.html',callback:last});
	}
	//--------------------------------------------------------
	var load_js=function(url,next){
		//this is js loader
		var ver=localStorage.getItem(url+"_ver");
		var txt=localStorage.getItem(url+"_txt");
		//------------------------------------------
		if(ver!=$vm.ver[2] || txt===null || $vm.debug===true || $vm.reload!=''){
			console.log('loading '+url+'?_='+$vm.ver[2]+$vm.reload);
			$.get(url+'?_='+$vm.ver[2]+$vm.reload,function(data){
				localStorage.setItem(url+"_txt",data);
				localStorage.setItem(url+"_ver",$vm.ver[2]);
				$('head').append('<scr'+'ipt>'+data+'</scr'+'ipt>');
				next();
			},'text');
		}
		else{ $('head').append('<scr'+'ipt>'+txt+'</scr'+'ipt>'); next(); }
		//------------------------------------------
	}
	//--------------------------------------------------------
	$vm.url=function(text){
		//replace some text in old modules to the correct ones
		text=text.replace(/__HOST__\//g,$vm.hosting_path+'/');
		text=text.replace(/__VER__/g,$vm.ver[0]);
		text=text.replace(/__BASE__\/vmiis\/Common-Code\//g,'__COMPONENT__/');
		text=text.replace(/__LIB__\/vmiis\/Common-Code\//g,'__COMPONENT__/');
		text=text.replace(/__BASE__\/vmiis\/common-code\//g,'__COMPONENT__/');
		text=text.replace(/__LIB__\/vmiis\/common-code\//g,'__COMPONENT__/');
		text=text.replace(/__PARTS__\//g,'https://vmiis.github.io/component/');
		text=text.replace(/__COMPONENT__\//g,'https://vmiis.github.io/component/');
		text=text.replace(/https:\/\/vmiis.github.io\/modular-distributed-web-application\//g,'https://www.vmiis.com/');
		if(window.location.hostname=='127.0.0.1' || window.location.hostname=='localhost'){
			//use local version
			text=text.replace(/https:\/\/cbs.wappsystem.com\/dev\/github/g,window.location.protocol+'//'+window.location.host);
			text=text.replace(/https:\/\/cbs.wappsystem.com\/pro\/github/g,window.location.protocol+'//'+window.location.host);
			//text=text.replace(/https:\/\/distributed-modules.vmiis.com/g,window.location.protocol+'//'+window.location.host+'/vmiis/distributed-modules');

			//do not use local system files
			text=text.replace(/http:\/\/127.0.0.1:8000\/vmiis\/api/g,'https://vmiis.github.io/api');
			text=text.replace(/http:\/\/127.0.0.1:8000\/vmiis\/framework/g,'https://vmiis.github.io/framework');
			text=text.replace(/http:\/\/127.0.0.1:8000\/vmiis\/component/g,'https://vmiis.github.io/component');
			text=text.replace(/http:\/\/127.0.0.1:8000\/vmiis\/modules/g,'https://vmiis.github.io/modules');

			text=text.replace(/https:\/\/woolcock-imr.github.io/g,					window.location.protocol+'//'+window.location.host+'/woolcock-imr');
			text=text.replace(/https:\/\/volunteer-database.rt.org.au/g,			window.location.protocol+'//'+window.location.host+'/woolcock-imr/volunteer-database-2');
			text=text.replace(/https:\/\/volunteer-database-management.rt.org.au/g,	window.location.protocol+'//'+window.location.host+'/woolcock-imr/volunteer-database-management-2');
			text=text.replace(/https:\/\/wappsystem.github.io/g,					window.location.protocol+'//'+window.location.host+'/wappsystem');

		}
		if(window.location.toString().indexOf('_d=1')!=-1){
			//use local system files
			var host=window.location.protocol+'//'+window.location.host;
			text=text.replace(/https:\/\/vmiis.github.io\/api/g,host+'/vmiis/api');
			text=text.replace(/https:\/\/vmiis.github.io\/framework/g,host+'/vmiis/framework');
			text=text.replace(/https:\/\/vmiis.github.io\/component/g,host+'/vmiis/component');
			text=text.replace(/https:\/\/vmiis.github.io\//g,host+'/vmiis/applications/');
		}
		if(window.location.toString().indexOf('_d=2')!=-1){
			//use latest unstable version (master branch, not gh-pages branch)
			text=text.replace(/https:\/\/vmiis.github.io\/api/g,'https://raw.githubusercontent.com/vmiis/api/master');
			text=text.replace(/https:\/\/vmiis.github.io\/framework/g,'https://raw.githubusercontent.com/vmiis/framework/master');
			text=text.replace(/https:\/\/vmiis.github.io\/component/g,'https://raw.githubusercontent.com/vmiis/component/master');
			text=text.replace(/https:\/\/vmiis.github.io\/modules/g,'https://raw.githubusercontent.com/vmiis/modules/master');
			text=text.replace(/http:\/\/127.0.0.1:8000\/vmiis\/api/g,'https://raw.githubusercontent.com/vmiis/api/master');
			text=text.replace(/http:\/\/127.0.0.1:8000\/vmiis\/framework/g,'https://raw.githubusercontent.com/vmiis/framework/master');
			text=text.replace(/http:\/\/127.0.0.1:8000\/vmiis\/component/g,'https://raw.githubusercontent.com/vmiis/component/master');
			text=text.replace(/http:\/\/127.0.0.1:8000\/vmiis\/modules/g,'https://raw.githubusercontent.com/vmiis/modules/master');
		}
		text=text.replace(/https:\/\/woolcock-imr.github.io\/sfix\//g,'https://sfix.rt.org.au/');
		text=text.replace(/https:\/\/woolcock-imr.github.io\/sfix\|/g,'https://sfix.rt.org.au|');
		text=text.replace(/https:\/\/woolcock-imr.github.io\/sfix-online-questionnaire\//g,'https://sfix-online-questionnaire.rt.org.au/');
		text=text.replace(/https:\/\/woolcock-imr.github.io\/sfix-online-questionnaire\|/g,'https://sfix-online-questionnaire.rt.org.au|');
		//text=text.replace(/https:\/\/woolcock-imr.github.io\/volunteer-database-management-2\//g,'https://volunteer-database-management.rt.org.au/');
		//text=text.replace(/https:\/\/woolcock-imr.github.io\/volunteer-database-management-2\|/g,'https://volunteer-database-management.rt.org.au|');
		return text;
	}
	//--------------------------------------------------------
	var last=function(){
		$('head').append("<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css'>");
        $('head').append("<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'>");
        $('head').append("<link rel='stylesheet' href='https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/themes/redmond/jquery-ui.css'>");
        $('head').append("<link rel='stylesheet' href='https://www.w3schools.com/w3css/4/w3.css'>");
        $.getScript('https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js',function(){$vm.js_popper=1;});
        $.getScript('https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js',function(){$vm.js_bootstrap=1;});
		$.getScript('https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/jquery-ui.min.js',function(){$vm.js_jquery_ui=1;});
		$.getScript('https://apis.google.com/js/plusone.js');
        $.getScript('https://ajax.aspnetcdn.com/ajax/jquery.validate/1.14.0/jquery.validate.min.js');
        $.getScript('https://sdk.amazonaws.com/js/aws-sdk-2.1.34.min.js');
		$.getScript('https://www.gstatic.com/charts/loader.js',function(){
			google.charts.load('current', {packages: ['corechart']});
		});
        $vm.module_list['_system_export_dialog_module']={table_id:'',url:'__COMPONENT__/dialog/export_dialog_module.html'};
        $vm.load_module_by_name('_system_export_dialog_module','',{})
        //-------------------------------------
        $vm.module_list['_system_import_dialog_module']={table_id:'',url:'__COMPONENT__/dialog/import_dialog_module.html'};
        $vm.load_module_by_name('_system_import_dialog_module','',{})
	}
	//********************************************************
	load_config_and_init();
	//********************************************************
}
