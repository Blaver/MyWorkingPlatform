/*
	A code template for a visualization targetvue
	Author : Nan Cao (nancao.org)
*/

vis.targetvue = function(){
	
	var targetvue = {},
		container = null,
		data = null,
		size = [303, 303],
		glyph_num=0,
	 	margin = {left:10, top:10, right:10, bottom:10},
		dispatch = d3.dispatch("select", "mouseover", "mouseout");

	targetvue.container = function(_) {
		if (!arguments.length) return container;
		container = _;
		return targetvue;
	};

	targetvue.data = function(_) {
		if (!arguments.length) return data;
		data = _;
		glyph_num = data.clusters.length;
		return targetvue;
	};

	targetvue.size = function(_) {
		if (!arguments.length) return size;
		size = _;
		return targetvue;
	};

	targetvue.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return targetvue;
	};

	targetvue.dispatch = dispatch;

	///////////////////////////////////////////////////
	// Private Parameters
    
	///////////////////////////////////////////////////
	// Public Function
	targetvue.layout = function() {
		var width = 750,
    		height = 580,
    		padding = 1.5, // separation between same-color circles
    		clusterPadding = 6, // separation between different-color circles
    		maxRadius =100;
    		maxRadiusSum = 250;
    	var n = glyph_num, // total number of circles
    		m = 1; // number of distinct clusters
    	var color = d3.scale.category10()
    		.domain(d3.range(m));	
    	var clusters = new Array(m);
    	var nodes = d3.range(n).map(function(j) {
    		var sum=0;
    		for(var s=0;s<cohort_size.length;s++){
    			sum+=cohort_size[s];
    		}
  			var i = Math.floor(Math.random() * m),
      			r=cohort_size[j]*maxRadius/Math.max.apply(null,cohort_size);
      			d = {cluster: i, radius: r};
  			if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
  			return d;
		});
		
		var force = d3.layout.force()
    		.nodes(nodes)
    		.size([width, height])
    		.gravity(0)
    		.charge(0)
    		.on("tick", tick)
    		.start();
		
		var drag = d3.behavior.drag()
						.on("drag",dragmove)
						.on("dragend",dragstop);
		
		function dragmove(d){
			force.stop();
			d3.select(this)
			  .attr("transform",function(d){
					return "translate("+(d3.event.x-d.radius)+","+(d3.event.y-d.radius)+")";
			});
			d.x=d3.event.x;
			d.y=d3.event.y;
			var close_flag=0;
			for(var i=0;i<glyph_num;i++){
				if(i!=d.index&&document.getElementById("glyph_"+i).hasChildNodes()){
					var r1=d.radius;
					var r2=d3.select("#glyph_"+i).data()[0].radius;
					var dist=Math.pow((Math.pow(d.x-d3.select("#glyph_"+i).data()[0].x,2)+Math.pow(d.y-d3.select("#glyph_"+i).data()[0].y,2)),0.5);
					if(dist<Math.abs(r1-r2)){
						close_flag=1;
						if(!document.getElementById("glyph_light")){
							d3.select("#glyph_"+i).append("circle")
												.attr("id","glyph_light")
												.style("fill",vis.temp_color[1])
												.attr("cx",d3.select("#glyph_"+i).data()[0].radius)
												.attr("cy",d3.select("#glyph_"+i).data()[0].radius)
												.attr("r",d3.select("#glyph_"+i).data()[0].radius)
												.attr("opacity","0.5");
						}
					}else if(close_flag==0) d3.select("#glyph_light").remove();
				}
			}
		}
		function dragstop(d){
			var R;
			for(var i=0;i<glyph_num;i++){
				if(document.getElementById("glyph_light")){
					d3.select("#glyph_light").remove();
				}
				if(i!=d.index&&document.getElementById("glyph_"+i).hasChildNodes()){
					var r1=d.radius;
					var r2=d3.select("#glyph_"+i).data()[0].radius;
					var dist=Math.pow(d.x-d3.select("#glyph_"+i).data()[0].x,2)+Math.pow(d.y-d3.select("#glyph_"+i).data()[0].y,2);
					if(dist<Math.pow(r1-r2,2)){
						//mergeGlyphs(d.index,i);
						console.log("merging"+d.index+"and"+i);
						force.start();
						return;
					}
				}
				force.start();
			}
		}
    			
    	var glyph_svg = container.selectAll(".glyph")
    		.data(nodes);
  			glyph_svg.enter()
  				.append("g")
  				.attr("class","glyph")
  				.attr("id",function(d){
  					return "glyph_"+d.index;
  				})
    			.call(drag)
    			.call(component.update)
    			.on("click",function(d){
    				//draw horizonal view
    				horizonal.hosp(cohort_hosp[d.index])
    						.temp_arr(data.clusters[d.index].temperature)
    						.treatments(data.clusters[d.index].treatments.length)
    						.treat_arr(data.clusters[d.index].treatments)
    						.render();
    				//draw mds view
    				mds.data(data.clusters[d.index].lab_coordinates2).update();
    				
    				heatmap.layout().render();
    			});
    	
    	function tick(e) {
  			glyph_svg
      			.each(cluster(50 * e.alpha * e.alpha))
      			.each(collide(.5))
      			.attr("transform",function(d){
					return "translate("+(d.x-d.radius)+","+(d.y-d.radius)+")";
			});
      	}
      	// Move d to be adjacent to the cluster node.
		function cluster(alpha) {
  			return function(d) {
    			var cluster = clusters[d.cluster],
        			k = 1;
    			// For cluster nodes, apply custom gravity.
    			if (cluster === d) {
      				cluster = {x: width/2, y: height/2, radius: -d.radius};
      				k = .1 * Math.sqrt(d.radius);
    			}
    			var x = d.x - cluster.x,
        			y = d.y - cluster.y,
        			l = Math.sqrt(x * x + y * y),
        			r = d.radius + cluster.radius;
    			if (l != r) {
      				l = (l - r) / l * alpha * k;
      				d.x -= x *= l;
      				d.y -= y *= l;
      				cluster.x += x;
      				cluster.y += y;
    			}
  			};
		}

		// Resolves collisions between d and all other circles.
		function collide(alpha) {
  			var quadtree = d3.geom.quadtree(nodes);
  			return function(d) {
    			var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
        			nx1 = d.x - r,
        			nx2 = d.x + r,
        			ny1 = d.y - r,
        			ny2 = d.y + r;
    			quadtree.visit(function(quad, x1, y1, x2, y2) {
      				if (quad.point && (quad.point !== d)) {
        				var x = d.x - quad.point.x,
            				y = d.y - quad.point.y,
            				l = Math.sqrt(x * x + y * y),
            				r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
        				if (l < r) {
          					l = (l - r) / l * alpha;
          					d.x -= x *= l;
          					d.y -= y *= l;
          					quad.point.x += x;
          					quad.point.y += y;
        				}
      				}
      			return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    			});
  			};
	}		
		return targetvue;
	};

	targetvue.render = function() {
		if(!container) {
			return;
		}
	
		return targetvue.update();
	};
		
	targetvue.update = function() {
		for(var i=0;i<glyph_num;i++){
			var canvas=d3.select("#glyph_"+i);
			var radius=d3.select("#glyph_"+i).data()[0].radius;
			var prop=radius/250;
			// canvas.append("circle")
			// .attr("cx",radius)
			// .attr("cy",radius)
			// .attr("r",radius);
			var data_num=25;
			var angle = d3.scale.linear().domain([0, data_num-1]).range([0, Math.PI * 2]);
			var orig_data=[];
			//generate fake data
			for(var m=0;m<25;m++){
				orig_data.push(Math.random());
			}
			var range_data=d3.scale.linear().domain([0,1]).range([100*prop,radius-50*prop]);
			var red_nodes=[];
			var blue_nodes=[];
			for(var j=0;j<orig_data.length;j++){
				if(angle(j)<=Math.PI/2){
					var x=range_data(orig_data[j])*Math.cos(Math.abs(Math.PI/2-angle(j)))+radius;
    				var y=radius-range_data(orig_data[j])*Math.sin(Math.abs(Math.PI/2-angle(j)));
					var r_x=range_data(0.5)*Math.cos(Math.abs(Math.PI/2-angle(j)))+radius;
					var r_y=radius-range_data(0.5)*Math.sin(Math.abs(Math.PI/2-angle(j)));
				}else if(angle(j)>Math.PI/2&&angle(j)<=Math.PI){
    				var x=range_data(orig_data[j])*Math.cos(Math.abs(Math.PI/2-angle(j)))+radius;
    				var y=radius+range_data(orig_data[j])*Math.sin(Math.abs(Math.PI/2-angle(j)));
    				var r_x=range_data(0.5)*Math.cos(Math.abs(Math.PI/2-angle(j)))+radius;
    				var r_y=radius+range_data(0.5)*Math.sin(Math.abs(Math.PI/2-angle(j)));
    			}else if(angle(j)>Math.PI&&angle(j)<3*Math.PI/4){
    				var x=radius-range_data(orig_data[j])*Math.sin(Math.abs(Math.PI-angle(j)));
    				var y=range_data(orig_data[j])*Math.cos(Math.abs(Math.PI-angle(j)))+radius;
    				var r_x=radius-range_data(0.5)*Math.sin(Math.abs(Math.PI-angle(j)));
    				var r_y=radius-range_data(0.5)*Math.sin(Math.abs(Math.PI-angle(j)));
    			}else if(angle(j)>=3*Math.PI/4){
    				var x=radius-range_data(orig_data[j])*Math.sin(Math.abs(2*Math.PI-angle(j)));
    				var y=radius-range_data(orig_data[j])*Math.cos(Math.abs(2*Math.PI-angle(j)));
    				var r_x=radius-range_data(0.5)*Math.sin(Math.abs(2*Math.PI-angle(j)));
    				var r_y=radius-range_data(0.5)*Math.cos(Math.abs(2*Math.PI-angle(j)));
    			}
    			red_nodes.push([x,y]);
				if(orig_data[j]>=0.5){
					blue_nodes.push([r_x,r_y]);
				}else{
					blue_nodes.push([x,y]);
				}
			}
			var path_red = canvas.append('path')
    			.data([red_nodes])
    			.attr('d', d3.svg.line().interpolate('linear'))
    			.attr('stroke-width', 0.5)
    			.attr('fill', '#d7191c')
    			.attr("stroke",'#d7191c')
    			.attr('class', 'red-poly');
			canvas.append("circle")
					.attr("cx",radius)
					.attr("cy",radius)
					.attr("r",radius-100*prop)
					.style("fill","#2c7bb6");
			var path_blue=canvas.append('path')
				.data([blue_nodes])
    			.attr('d', d3.svg.line().interpolate('linear'))
    			.attr('stroke-width', 0.5)
    			.attr('fill', 'white')
    			.attr("stroke",'white')
    			.attr('class', 'white-poly');
    		canvas.append("circle")
    				.attr("cx",radius)
    				.attr("cy",radius)
    				.attr("r",30*prop)
    				.style("fill",vis.border_blue);
		}
		return targetvue;
	};
	
	///////////////////////////////////////////////////
	// Private Functions
	
	function private_function1() {
		
	};
	
	function private_function2() {
		
	};
	
	function private_function3() {
		
	};
	
	return targetvue;
};
