/*
	A code template for a visualization component
	Author : Nan Cao (nancao.org)
*/

vis.component = function(){
	
	var component = {},
		container = null,
		data = [],
		size = [960, 590],
	 	margin = {left:10, top:10, right:10, bottom:10},
	 	cluster_num = 0;
	 	cohort_size=[];
	 	cohort_hosp=[];
	 	hosp_opac=[];
	 	treatment_num=[];
		dispatch = d3.dispatch("select", "mouseover", "mouseout");

	component.container = function(_) {
		if (!arguments.length) return container;
		container = _;
		return component;
	};

	component.data = function(_) {
		if (!arguments.length)  return data;
		data= _;
		cluster_num = data.clusters.length;
		for(var i=0;i<cluster_num;i++){
			cohort_size[i]=data.clusters[i].cohort.length;
		}
		//cohort_hosp=[264,274,356,338,284,260,339,359,359,264];//TODO
		cohort_hosp=[11,12,15,14,13,11,14,15,15,11];//TODO
		hosp_opac=[1,0.98,0.97,0.8,0.77,0.75,0.7,0.6,0.6,0.59,0.55,0.5,0.5,0.44,0.4];//TODO
		for(var i=0;i<cluster_num;i++){
			treatment_num[i]=data.clusters[i].treatments.length;
		}
		console.log(data);
		return component;
	};

	component.size = function(_) {
		if (!arguments.length) return size;
		size = _;
		return component;
	};

	component.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return component;
	};

	component.dispatch = dispatch;

	///////////////////////////////////////////////////
	// Private Parameters
    
	///////////////////////////////////////////////////
	// Public Function
	component.layout = function() {
		var width = 750,
    		height = 580,
    		padding = 1.5, // separation between same-color circles
    		clusterPadding = 6, // separation between different-color circles
    		maxRadius =100;
    		maxRadiusSum = 250;
    	var n = cluster_num, // total number of circles
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
      			//r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
      			//r=cohort_size[j]*maxRadiusSum/sum;
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
			for(var i=0;i<cluster_num;i++){
				if(i!=d.index&&document.getElementById("cluster_"+i).hasChildNodes()){
					var r1=d.radius;
					var r2=d3.select("#cluster_"+i).data()[0].radius;
					var dist=Math.pow((Math.pow(d.x-d3.select("#cluster_"+i).data()[0].x,2)+Math.pow(d.y-d3.select("#cluster_"+i).data()[0].y,2)),0.5);
					if(dist<Math.abs(r1-r2)){
						close_flag=1;
						if(!document.getElementById("merge_light")){
							d3.select("#cluster_"+i).append("circle")
												.attr("id","merge_light")
												.style("fill",vis.temp_color[1])
												.attr("cx",d3.select("#cluster_"+i).data()[0].radius)
												.attr("cy",d3.select("#cluster_"+i).data()[0].radius)
												.attr("r",d3.select("#cluster_"+i).data()[0].radius)
												.attr("opacity","0.5");
						}
					}else if(close_flag==0) d3.select("#merge_light").remove();
				}
			}
		}
		function dragstop(d){
			var R;
			for(var i=0;i<cluster_num;i++){
				if(document.getElementById("merge_light")){
					d3.select("#merge_light").remove();
				}
				if(i!=d.index&&document.getElementById("cluster_"+i).hasChildNodes()){
					var r1=d.radius;
					var r2=d3.select("#cluster_"+i).data()[0].radius;
					var dist=Math.pow(d.x-d3.select("#cluster_"+i).data()[0].x,2)+Math.pow(d.y-d3.select("#cluster_"+i).data()[0].y,2);
					if(dist<Math.pow(r1-r2,2)){
						mergeClusters(d.index,i);
						console.log("merging"+d.index+"and"+i);
						force.start();
						return;
					}
				}
				force.start();
			}
		}
    			
    	var cluster_svg = container.selectAll(".cohort")
    		.data(nodes);
  			cluster_svg.enter()
  				.append("g")
  				.attr("class","cohort")
  				.attr("id",function(d){
  					return "cluster_"+d.index;
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
    			// .on("dblclick",function(d){
    				// //draw large icon
    				// console.log("double click!!!");
    				// var svg_addon=container.append("g");
    					// svg_addon.append("rect")
    							// .attr("width",740)
    							// .attr("height",570)
    							// .style("fill","gray")
    							// .attr("opacity","0.5");
    				// var bglayer=svg_addon.append("g").attr("transform","translate(120,35)");
    				// bglayer.append("circle").attr("cx",250).attr("cy",250).attr("r",250).style("fill","#ffffff");
    				// drawAddOns(bglayer,d.index,250);
//     				
    			// });
    	
    	function tick(e) {
  			cluster_svg
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
		return component;
	};

	component.render = function() {
		if(!container) {
			return;
		}
		// var blankbg = container.append("rect");
			// blankbg.attr("width",980)
			 		// .attr("height",580)
			 		// .attr("opacity",0)
			 		// .attr("class","blankbg")
			 		// .on("click",function(){
// 
			 		// });
		return component.update();
	};
		
	component.update = function() {
		for(var i=0;i<cluster_num;i++){
			drawWithCID(i);
		}
	};
	
	///////////////////////////////////////////////////
	// Private Functions
	var cluster_angle;
	var prop;
	var hosp_angleEach;
	var hosp_angleGap;
	
	function drawAddOns(canvas,cluster_id,R){
		drawHosp(canvas,cohort_hosp[cluster_id],R);
		drawTemp(canvas,data.clusters[cluster_id].temperature,R);					
		drawTreatment(canvas,R,data.clusters[cluster_id].treatments,cohort_hosp[cluster_id]);
		drawMDS(canvas,data.clusters[cluster_id].lab_coordinates2,R);
	}
	
	function drawWithCID(cluster_id){
		drawHosp(d3.select("#cluster_"+cluster_id),
							cohort_hosp[cluster_id],
							d3.select("#cluster_"+cluster_id).data()[0].radius);
		drawTemp(d3.select("#cluster_"+cluster_id),
				data.clusters[cluster_id].temperature,
				d3.select("#cluster_"+cluster_id).data()[0].radius);					
		drawTreatment(d3.select("#cluster_"+cluster_id),
						d3.select("#cluster_"+cluster_id).data()[0].radius,
						data.clusters[cluster_id].treatments,
						cohort_hosp[cluster_id]);
		drawMDS(d3.select("#cluster_"+cluster_id),
				data.clusters[cluster_id].lab_coordinates2,
				d3.select("#cluster_"+cluster_id).data()[0].radius);
	}
	
	function mergeClusters(c_id1,c_id2){
		hosp=Math.max(cohort_hosp[c_id1],cohort_hosp[c_id2]);
		r1=d3.select("#cluster_"+c_id1).data()[0].radius;
		r2=d3.select("#cluster_"+c_id2).data()[0].radius;
		radius=r1+r2;
		if(r1>r2){
			d3.select("#cluster_"+c_id2).text("");
			d3.select("#cluster_"+c_id1).text("");
			drawHosp(d3.select("#cluster_"+c_id1),cohort_hosp[c_id1],radius);
			drawTemp(d3.select("#cluster_"+c_id1),data.clusters[c_id1].temperature,radius);
			drawTreatment(d3.select("#cluster_"+c_id1),
						radius,
						data.clusters[c_id1].treatments,
						cohort_hosp[c_id1]);
			drawMDS(d3.select("#cluster_"+c_id1),
				data.clusters[c_id1].lab_coordinates2,
				radius);
			d3.select("#cluster_"+c_id1).data()[0].radius=radius;
			d3.select("#cluster_"+c_id2).data()[0].radius=0;
		}
		else{
			d3.select("#cluster_"+c_id1).text("");
			d3.select("#cluster_"+c_id2).text("");
			drawHosp(d3.select("#cluster_"+c_id2),cohort_hosp[c_id2],radius);
			drawTemp(d3.select("#cluster_"+c_id2),data.clusters[c_id2].temperature,radius);
			drawTreatment(d3.select("#cluster_"+c_id2),
						radius,
						data.clusters[c_id2].treatments,
						cohort_hosp[c_id2]);
			drawMDS(d3.select("#cluster_"+c_id2),
				data.clusters[c_id2].lab_coordinates2,
				radius);
			d3.select("#cluster_"+c_id2).data()[0].radius=radius;
			d3.select("#cluster_"+c_id1).data()[0].radius=0;
		}
	}
	//draw cluster with specific data
	function drawHosp(canvas,hosp,radius){
		prop = radius/250;
		var hosp_width=15*prop;
		var hosp_outerR=205*prop;	
		var maxhosp=15;
		cluster_angle = 2*(hosp/maxhosp)*Math.PI;
		var angleGap = Math.PI/144;
		hosp_angleGap=angleGap;
		var angleEach = function(){
			if(cluster_angle==2*Math.PI) return (cluster_angle-hosp*angleGap)/hosp;
			else return (cluster_angle-(hosp-1)*angleGap)/hosp;
		}();
		hosp_angleEach = angleEach;
		for(var i=0;i<hosp;i++){
			var arc_hosp = d3.svg.arc()
				.outerRadius(hosp_outerR)
				.innerRadius(hosp_outerR-hosp_width)
				.startAngle(function(){
					if(i==0) return 0;
					else return angleEach*i+i*angleGap;
				})
				.endAngle(angleEach*(i+1)+i*angleGap);
			canvas.append("path")
					.attr("class","arc")
					.attr("d",arc_hosp)
					.attr("fill",vis.hosp_blue)
					.attr("opacity",hosp_opac[i])
					.attr("transform",function(){
						return "translate("+radius+","+radius+")";
					});
		}
	}
	
	function drawTemp(canvas,temp_seq,radius){
		prop = radius/250;
		var temp_outerR=250*prop;
		var temp_width_arr=[10,10,25];
		for(var i=0;i<3;i++){
			var temp_width=temp_width_arr[i]*prop;
			var arc_temp = d3.svg.arc()
    			.innerRadius(temp_outerR-temp_width)
    			.outerRadius(temp_outerR)
    			.startAngle(0)
    			.endAngle(cluster_angle);
    		canvas.append("path")
    				.attr("class", "arc")
    				.attr("d", arc_temp)
    				.attr("fill",vis.temp_color[i])
    				.attr("transform",function(){
						return "translate("+radius+","+radius+")";
					});
    		temp_outerR=temp_outerR-temp_width;
    	}
    	
    		//calculate x,y
    		var temp_nodes=[];
    		var angleDevi = cluster_angle/temp_seq.length;
    		var x,y;
    		var r=temp_outerR;
    		var scale=d3.scale.pow();
    			scale.domain([36,37.5,39,40.5])
    				.range([0,25,35,45]);
    		var temp_seq_range=[];
    		for(var t=0;t<temp_seq.length;t++){
    			temp_seq_range.push(scale(temp_seq[t]));
    		}
    		for(var j=0;j<temp_seq.length;j++)
    		{
    			//var radiusR=(temp_seq[j]-36)*temp_width/1.5+radius;
    			var radiusR=temp_seq_range[j]*prop+r;
    			 if(angleDevi*j<=Math.PI/2){
    				x=radiusR*Math.cos(Math.abs(Math.PI/2-angleDevi*j))+radius;
    				y=radius-radiusR*Math.sin(Math.abs(Math.PI/2-angleDevi*j));
    				temp_nodes.push([x,y]);
    			}else if(angleDevi*j>Math.PI/2&&angleDevi*j<=Math.PI){
    				x=radiusR*Math.cos(Math.abs(Math.PI/2-angleDevi*j))+radius;
    				y=radius+radiusR*Math.sin(Math.abs(Math.PI/2-angleDevi*j));
    				temp_nodes.push([x,y]);
    			}else if(angleDevi*j>Math.PI&&angleDevi*j<3*Math.PI/4){
    				x=radius-radiusR*Math.sin(Math.abs(Math.PI-angleDevi*j));
    				y=radius+radiusR*Math.cos(Math.abs(Math.PI-angleDevi*j));
    				temp_nodes.push([x,y]);
    			}else if(angleDevi*j>=3*Math.PI/4){
    				x=radius-radiusR*Math.sin(Math.abs(2*Math.PI-angleDevi*j));
    				y=radius-radiusR*Math.cos(Math.abs(2*Math.PI-angleDevi*j));
    				temp_nodes.push([x,y]);
    			}
    		}
    		var path = canvas.append('path')
    			.data([temp_nodes])
    			.attr('d', d3.svg.line().interpolate('basis'))
    			.attr('stroke-weight', '10px')
    			.attr('fill', 'none')
    			.attr("stroke",vis.border_blue)
    			.attr('class', 'poly');
	}
	
	function drawTreatment(canvas,radius,treatment_arr,hosp){
		prop = radius/250;
		treat_outerR = 183*prop;
		var treatments = treatment_arr.length;
		var treat_width = 5*prop;
		var dot_width = 7*prop;
		for(var i=0;i<treatments;i++){
			var treat_arr=treatment_arr[i];
			var arc_dotted = d3.svg.arc()
				.outerRadius(treat_outerR)
				.innerRadius(treat_outerR)
				.startAngle(0)
				.endAngle(cluster_angle);
			canvas.append("path")
					.attr("class","arc")
					.attr("d",arc_dotted)
					.attr("fill","white")
					.attr("stroke",vis.dotted)
					.attr("stroke-linecap","square")
					.attr("stroke-dasharray","1,10")
					.attr("transform","translate("+radius+","+radius+")");	
			for(var j=0;j<hosp;j++){
				var treat_day=treat_arr.slice(j*144,(j+1)*144-1);
				var angleFull = hosp_angleEach;
				var angleGap = Math.PI/288;
				var angleEach = (angleFull-5*angleGap)/6;
				var startAngle=j*hosp_angleGap+j*hosp_angleEach;
				var endAngle=j*hosp_angleGap+j*hosp_angleEach+angleEach;
				for(var n=0;n<6;n++){
					var treat_hr = treat_day.slice(n*24,(n+1)*24-1);
					var flag=Math.max.apply(null,treat_hr);
					if(flag.toFixed(3)>0){
						var arc_treat=d3.svg.arc()
							.outerRadius(treat_outerR+1/2*treat_width)
							.innerRadius(treat_outerR-1/2*treat_width)
							.startAngle(startAngle)
							.endAngle(endAngle);
						canvas.append("path")
							.attr("class","arc")
							.attr("d",arc_treat)
							.attr("fill",vis.treat_color[i])
							.attr("transform","translate("+radius+","+radius+")");
					}
					if(n==5){
						startAngle=startAngle+hosp_angleGap+angleEach;
					}else{
						startAngle=startAngle+angleGap+angleEach;
					}
					endAngle=startAngle+angleEach;	
				}
			}
			treat_outerR=treat_outerR-dot_width;
		}
	}
	
	function drawMDS(canvas,lab_coord,radius){
		prop = radius/250;
		var nodes_ori = lab_coord;
		var nodes_center=function(){
			var x_sum=0,
				y_sum=0;
			for(var i=0;i<nodes_ori.length;i++){
				x_sum=x_sum+nodes_ori[i][0];
				y_sum=y_sum+nodes_ori[i][1];
			}
			return [x_sum/nodes_ori.length,y_sum/nodes_ori.length];
		}();
		var radiusR=treat_outerR-7*prop;
		var R=radius;
		var prop_dist=function(){
			var temp=0;
			var temp_node=[];
			for(var i=0;i<nodes_ori.length;i++){
				var dist=Math.pow((nodes_ori[i][0]-nodes_center[0]),2)+Math.pow((nodes_ori[i][1]-nodes_center[1]),2);
				if(dist>temp){
					temp=dist;
				}
			}
			return (radiusR-5*prop)/Math.pow(temp,0.5);
		}();
		
		var arc_border=d3.svg.arc()
			.outerRadius(treat_outerR)
			.innerRadius(treat_outerR-5*prop)
			.startAngle(0)
			.endAngle(2*Math.PI);
		canvas.append("path")
				.attr("class","arc")
				.attr("d",arc_border)
				.attr("fill",vis.border_blue)
				.attr("transform","translate("+radius+","+radius+")");
		var nodes=[];
		for(var i=0;i<nodes_ori.length;i++){
			var range_x = nodes_ori[i][0]*prop_dist+R;
			var range_y = R+nodes_ori[i][1]*prop_dist;
			nodes.push([range_x,range_y]);
		}
		for(var j=0;j<nodes_ori.length;j++){
			var mds_dots = canvas.selectAll(".mds")
				.data(nodes);
			mds_dots.exit().remove();	
			mds_dots.enter().append('g')
					.attr("class","mds")
					.append('circle')
					.attr("cx",function(d){return d[0];})
					.attr("cy",function(d){return d[1];})
					.attr("r",4*prop)
					.style("fill",vis.border_blue);
		}	
	}
	function private_function2() {
		// var vcohort = container.selectAll(".cohort")
				// .data(data);
		// vcohort.exit().remove();
		// vcohort.enter().append("g")
				// .attr("class", "cohort")
				// .append("circle")
				// .attr("cx", function(d){return d.x;})
				// .attr("cy", function(d){return d.y;})
				// .attr("r", function(d){return d.r;})
				// .style("fill",vis.temp_red);	
	};
	
	function private_function3() {
		
	};
	
	return component;
};

