/*
	A code template for a visualization rawdata
	Author : Nan Cao (nancao.org)
*/

vis.rawdata = function(){
	
	var rawdata = {},
		container = null,
		data = null,
		size = [960, 800],
	 	margin = {left:10, top:10, right:10, bottom:10},
		dispatch = d3.dispatch("select", "mouseover", "mouseout");

	rawdata.container = function(_) {
		if (!arguments.length) return container;
		container = _;
		return rawdata;
	};

	rawdata.data = function(_) {
		if (!arguments.length) return data;
		data = _;
		console.log(data);
		return rawdata;
	};

	rawdata.size = function(_) {
		if (!arguments.length) return size;
		size = _;
		return rawdata;
	};

	rawdata.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return rawdata;
	};

	rawdata.dispatch = dispatch;

	///////////////////////////////////////////////////
	// Private Parameters
    
	///////////////////////////////////////////////////
	// Public Function
	rawdata.layout = function() {
		return rawdata;
	};

	rawdata.render = function() {
		if(!container) {
			return;
		}
		//ugly black list
		// for(var i=0;i<data.patients.length;i++){
			// var patient=container.append("li").attr("class","has-children");
			// patient.append("input")
					// .attr("type","checkbox")
					// .attr("name","group-"+i)
					// .attr("id","group-"+i);
			// patient.append("label")
					// .attr("for","group-"+i)
					// .text(data.patients[i].id);
			// var submenu=patient.append("ul");
			// submenu.append("li").append("a").attr("href","#0").text("in_date:"+data.patients[i].in_date);
			// submenu.append("li").append("a").attr("href","#0").text("out_date:"+data.patients[i].out_date);
			// var labtests=submenu.append("li").attr("class","has-children");
			// labtests.append("input")
					// .attr("type","checkbox")
					// .attr("name","labgroup-"+i)
					// .attr("id","labgroup-"+i);
			// labtests.append("label")
					// .attr("for","labgroup-"+i)
					// .text("Lab Results");
			// var lab_sub=labtests.append("ul");
			// for(var j=0;j<data.patients[i].tests.length;j++){
				// lab_sub.append("li").append("a").attr("href","#0").text(j+":"+data.patients[i].tests[j]);
			// }
		// }
		
		for(var i=0;i<data.patients.length;i++){
			var patient=container.append("h3")
								.text(data.patients[i].id);
			var content=container.append("div")
								.attr("id",data.patients[i].id);
			var p_id=content.append("p")
						.html("<b>Patient ID:</b>"+data.patients[i].id);
			var in_date=parseDate(data.patients[i].in_date);
			var out_date=parseDate(data.patients[i].out_date);
			var in_date=content.append("p")
								.html("<b>In Time:</b>"+in_date);
			var out_date=content.append("p")
								.html("<b>Out Time:</b>"+out_date);
		}
		return rawdata.update();
	};
		
	rawdata.update = function() {
		
		return rawdata;
	};
	
	///////////////////////////////////////////////////
	// Private Functions
	function parseDate(date){
		var dt1=new Date("00:00:00 1/1/1900");
		var dt=date*24*60*60*1000;
		var milli=dt+dt1.getTime();
		var result=new Date(milli);
		var year=result.getFullYear();
		var month=result.getMonth()+1;
		if(month<10){
			month="0"+month;
		}
		var day=result.getDate();
		if(day<10){
			day="0"+day;
		}
		var hour=result.getHours();
		if(hour<10){
			hour="0"+hour;
		}
		var minute=result.getMinutes();
		if(minute<10){
			minute="0"+minute;
		}
		var second=result.getSeconds();
		if(second<10){
			second="0"+second;
		}
		var str=year+"-"+month+"-"+day+"  "+hour+":"+minute+":"+second;
		return str;
	}
	function private_function1() {
		
	};
	
	function private_function2() {
		
	};
	
	function private_function3() {
		
	};
	
	return rawdata;
};