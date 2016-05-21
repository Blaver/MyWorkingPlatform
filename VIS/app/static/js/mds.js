/*
	A code template for a visualization mds
	Author : Nan Cao (nancao.org)
*/

vis.mds = function(){
	
	var mds = {},
		container = null,
		data = null,
		nodes_mds=[],
		size = [303, 303],
	 	margin = {left:10, top:10, right:10, bottom:10},
		dispatch = d3.dispatch("select", "mouseover", "mouseout");

	mds.container = function(_) {
		if (!arguments.length) return container;
		container = _;
		return mds;
	};

	mds.data = function(_) {
		if (!arguments.length) return data;
		data = _;
		return mds;
	};

	mds.size = function(_) {
		if (!arguments.length) return size;
		size = _;
		return mds;
	};

	mds.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return mds;
	};

	mds.dispatch = dispatch;

	///////////////////////////////////////////////////
	// Private Parameters
    
	///////////////////////////////////////////////////
	// Public Function
	mds.layout = function() {
		var line;
		var nodes=[];
		var select_nodes=[];
		container.on("mousedown",mousedown)
				.on("mouseup",mouseup);
		function mousedown(){
			select_nodes=[];
			if(d3.select("#drawline")[0][0]!=null){
				document.getElementById("drawline").remove();
			}
			nodes=[];
			console.log("mouse down!");
			var m=d3.mouse(this);
			nodes.push([m[0],m[1]]);
			console.log(nodes);
			container.on("mousemove",mousemove);
		}
		function mousemove(){
			console.log("mouse move!");
			if(d3.select("#drawline")[0][0]!=null){
				document.getElementById("drawline").remove();
			}
			var m=d3.mouse(this);
			nodes.push([m[0],m[1]]);
			line=container.append('path')
    			.data([nodes])
    			.attr("id","drawline")
    			.attr('d', d3.svg.line().interpolate('basis-closed'))
    			.attr('stroke-weight', '2px')
    			.attr('fill', vis.temp_color[1])
    			.attr("opacity",0.5)
    			.attr("stroke",vis.border_blue)
    			.attr('class', 'poly');
		}
		function mouseup(){
			container.on("mousemove",null);
			var x_range=[500,-500];
			var y_range=[500,-500];
			var nodes_line=nodes;
			for(var i=0;i<nodes_line.length;i++){
				if(nodes_line[i][0]<x_range[0]){
					x_range[0]=nodes_line[i][0];
				}
				if(nodes_line[i][0]>x_range[1]){
					x_range[1]=nodes_line[i][0];
				}
				if(nodes_line[i][1]<y_range[0]){
					y_range[0]=nodes_line[i][1];
				}
				if(nodes_line[i][1]>y_range[1]){
					y_range[1]=nodes_line[i][1];
				}
			}
			for(var i=0;i<container.selectAll(".mds_main").data().length;i++){
				var intersect=-1;
				var x=container.selectAll(".mds_main").data()[i][0];
				var y=container.selectAll(".mds_main").data()[i][1];
				if(x>x_range[0]&&x<x_range[1]&&y<y_range[1]&&y>y_range[0]){
					for(var j=0;j<nodes_line.length-1;j++){
						if(x>nodes_line[j][0]&&x<nodes_line[j+1][0]) intersect=intersect+1;
					}
					if(intersect%2==0){
						select_nodes.push(i);
					}
				}
			}
			console.log(select_nodes);
		}
		return mds;
	};

	mds.render = function() {
		if(!container) {
			return;
		}
		return mds.update();
	};
		
	mds.update = function() {
		container.text("");
		drawMDSView();
		return mds;
	};
	
	///////////////////////////////////////////////////
	// Private Functions
	function drawMDSView(){
		var nodes_ori = data;
		var nodes_center=function(){
			var x_sum=0,
				y_sum=0;
			for(var i=0;i<nodes_ori.length;i++){
				x_sum=x_sum+nodes_ori[i][0];
				y_sum=y_sum+nodes_ori[i][1];
			}
			return [x_sum/nodes_ori.length,y_sum/nodes_ori.length];
		}();
		var prop_dist=function(){
			var temp=0;
			var temp_node=[];
			for(var i=0;i<nodes_ori.length;i++){
				var dist=Math.pow((nodes_ori[i][0]-nodes_center[0]),2)+Math.pow((nodes_ori[i][1]-nodes_center[1]),2);
				if(dist>temp){
					temp=dist;
				}
			}
			return 145/Math.pow(temp,0.5);
		}();
		nodes_mds=[];
		for(var i=0;i<nodes_ori.length;i++){
			var range_x = nodes_ori[i][0]*prop_dist+151;
			var range_y = 151+nodes_ori[i][1]*prop_dist;
			nodes_mds.push([range_x,range_y]);
		}
		for(var j=0;j<nodes_ori.length;j++){
			var mds_dots = container.selectAll(".mds_main")
				.data(nodes_mds);
			mds_dots.exit().remove();	
			mds_dots.enter().append('g')
					.attr("class","mds_main")
					.attr("id",function(d,i){return "mds_"+i;})
					.append('circle')
					.attr("cx",function(d){return d[0];})
					.attr("cy",function(d){return d[1];})
					.attr("r",3)
					.style("fill",vis.border_blue);
		}	
	}
	
	function private_function1() {
		
	};
	
	function private_function2() {
		
	};
	
	function private_function3() {
		
	};
	
	return mds;
};

