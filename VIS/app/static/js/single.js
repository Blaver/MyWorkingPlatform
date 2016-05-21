/*
	A code template for a visualization single
	Author : Nan Cao (nancao.org)
*/

vis.single = function(){
	
	var single = {},
		container = null,
		data = null,
		size = [303, 303],
		patient_num = 0;
	 	patient_hosp=[];
	 	margin = {left:10, top:10, right:10, bottom:10},
		dispatch = d3.dispatch("select", "mouseover", "mouseout");

	single.container = function(_) {
		if (!arguments.length) return container;
		container = _;
		return single;
	};

	single.data = function(_) {
		if (!arguments.length) return data;
		data = _;
		patient_num=30;
		for(var i=0;i<patient_num;i++){
			patient_hosp[i]=Math.ceil(data.patients[i].out_date-data.patients[i].in_date);
		}
		return single;
	};

	single.size = function(_) {
		if (!arguments.length) return size;
		size = _;
		return single;
	};

	single.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return single;
	};

	single.dispatch = dispatch;

	///////////////////////////////////////////////////
	// Private Parameters
    
	///////////////////////////////////////////////////
	// Public Function
	single.layout = function() {
		var width = 750,
    		height = 580,
    		padding = 1.5, // separation between same-color circles
    		clusterPadding = 6, // separation between different-color circles
    		maxRadius =70;
    	var n = patient_num, // total number of circles
    		m = 1; // number of distinct clusters
    	var color = d3.scale.category10()
    		.domain(d3.range(m));	
    	var clusters = new Array(m);
    	var nodes = d3.range(n).map(function(j) {
  			var i = Math.floor(Math.random() * m),
      			//r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
      			r=40;
      			d = {cluster: i, radius: r};
  			if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
  			return d;
		});
		
		var drag = d3.behavior.drag()
						.on("drag",dragmove)
						.on("dragend",dragstop);
		
		function dragmove(d){
			d3.select(this)
			  .attr("transform",function(d){
					return "translate("+(d3.event.x-d.radius)+","+(d3.event.y-d.radius)+")";
			});
		}
		
		function dragstop(d){
			force.start();
		}
		
		var force = d3.layout.force()
    		.nodes(nodes)
    		.size([width, height])
    		.gravity(0)
    		.charge(0)
    		.on("tick", tick)
    		.start();
    			
    	var cluster_svg = container.selectAll(".cohort")
    		.data(nodes);
  			cluster_svg.enter()
  				.append("g")
  				.attr("class","cohort")
  				.attr("id",function(d){
  					return "patient_"+d.index;
  				})
    			.call(drag)
    			.call(single.update);
    	
    	function tick(e) {
  			cluster_svg
      			.each(cluster(10 * e.alpha * e.alpha))
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
		return single;
	};

	single.render = function() {
		if(!container) {
			return;
		}
	
		return single.update();
	};
		
	single.update = function() {
		for(var i=0;i<patient_num;i++){
			// drawHospLayer(i);
			// drawTempLayer(i);
			// drawTreatmentLayer(i);
			// drawMDSLayer(i);
			drawOnePatient(i);
		 }
		return single;
	};
	
	///////////////////////////////////////////////////
	// Private Functions
	function drawOnePatient(p_id){
		//draw hosp
		prop = d3.select("#patient_"+p_id).data()[0].radius/250;
		var hosp_width=15*prop;
		var hosp_outerR=160*prop;	
		var hosp = patient_hosp[p_id];
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
			d3.select("#patient_"+p_id).append("path")
					.attr("class","arc")
					.attr("d",arc_hosp)
					.attr("fill",vis.hosp_blue)
					.attr("transform",function(){
						return "translate("+d3.select("#patient_"+p_id).data()[0].radius+","+d3.select("#patient_"+p_id).data()[0].radius+")";
					});
		}
		//draw temp
		var temp_width = 30*prop;
		var temp_outerR=250*prop;
		
		for(var i=0;i<3;i++){
			var arc_temp = d3.svg.arc()
    			.innerRadius(temp_outerR-temp_width)
    			.outerRadius(temp_outerR)
    			.startAngle(0)
    			.endAngle(cluster_angle);
    		d3.select("#patient_"+p_id).append("path")
    				.attr("class", "arc")
    				.attr("d", arc_temp)
    				.attr("fill",vis.temp_color[i])
    				.attr("transform",function(){
						return "translate("+d3.select("#patient_"+p_id).data()[0].radius+","+d3.select("#patient_"+p_id).data()[0].radius+")";
					});
    		temp_outerR=temp_outerR-temp_width;
    	}
    	var arc_start=d3.svg.arc()
    	    .innerRadius(temp_outerR)
    	    .outerRadius(280*prop)
    	    .startAngle(-Math.PI/288)
    	    .endAngle(0);
    	// d3.select("#patient_"+p_id).append("path")
    				// .attr("class", "arc")
    				// .attr("d", arc_start)
    				// .attr("fill","red")
    				// .attr("transform",function(){
						// return "translate("+d3.select("#patient_"+p_id).data()[0].radius+","+d3.select("#patient_"+p_id).data()[0].radius+")";
					// });
    	
    		var temp_seq=data.patients[p_id].temperatures;
    		//calculate x,y
    		var temp_nodes=[];
    		var angleDevi = cluster_angle/temp_seq.length;
    		var x,y;
    		var radius=temp_outerR;
    		for(var j=0;j<temp_seq.length;j++)
    		{
    			var radiusR=(temp_seq[j]-36)*temp_width/1.5+radius;
    			 if(angleDevi*j<=Math.PI/2){
    				x=radiusR*Math.cos(Math.abs(Math.PI/2-angleDevi*j))+d3.select("#patient_"+p_id).data()[0].radius;
    				y=d3.select("#patient_"+p_id).data()[0].radius-radiusR*Math.sin(Math.abs(Math.PI/2-angleDevi*j));
    				temp_nodes.push([x,y]);
    			}else if(angleDevi*j>Math.PI/2&&angleDevi*j<=Math.PI){
    				x=radiusR*Math.cos(Math.abs(Math.PI/2-angleDevi*j))+d3.select("#patient_"+p_id).data()[0].radius;
    				y=d3.select("#patient_"+p_id).data()[0].radius+radiusR*Math.sin(Math.abs(Math.PI/2-angleDevi*j));
    				temp_nodes.push([x,y]);
    			}else if(angleDevi*j>Math.PI&&angleDevi*j<3*Math.PI/4){
    				x=d3.select("#patient_"+p_id).data()[0].radius-radiusR*Math.sin(Math.abs(Math.PI-angleDevi*j));
    				y=d3.select("#patient_"+p_id).data()[0].radius+radiusR*Math.cos(Math.abs(Math.PI-angleDevi*j));
    				temp_nodes.push([x,y]);
    			}else if(angleDevi*j>=3*Math.PI/4){
    				x=d3.select("#patient_"+p_id).data()[0].radius-radiusR*Math.sin(Math.abs(2*Math.PI-angleDevi*j));
    				y=d3.select("#patient_"+p_id).data()[0].radius-radiusR*Math.cos(Math.abs(2*Math.PI-angleDevi*j));
    				temp_nodes.push([x,y]);
    			}
    		}
    		var path = d3.select("#patient_"+p_id).append('path')
    			.data([temp_nodes])
    			.attr('d', d3.svg.line().interpolate('basis'))
    			.attr('stroke-weight', '10px')
    			.attr('fill', 'none')
    			.attr("stroke",vis.border_blue)
    			.attr('class', 'poly');
    	//draw treatment
    	treat_outerR = 138*prop;
		var treatments = data.patients[p_id].treatments.length;
		var treat_width = 5*prop;
		var dot_width = 7*prop;
		for(var i=0;i<1;i++){
			var arc_dotted = d3.svg.arc()
				.outerRadius(treat_outerR)
				.innerRadius(treat_outerR)
				.startAngle(0)
				.endAngle(cluster_angle);
			d3.select("#patient_"+p_id).append("path")
					.attr("class","arc")
					.attr("d",arc_dotted)
					.attr("fill","white")
					.attr("stroke",vis.dotted)
					.attr("stroke-linecap","square")
					.attr("stroke-dasharray","1,10")
					.attr("transform","translate("+d3.select("#patient_"+p_id).data()[0].radius+","+d3.select("#patient_"+p_id).data()[0].radius+")");
			
			var startAngle = 0;
			var endAngle = 0;
			for(var j=0;j<patient_hosp[p_id];j++){
				var treatment_day=data.patients[p_id].treatments.slice(j*6,(j+1)*6-1);
				var angleFull = hosp_angleEach;
				var angleGap = Math.PI/288;
				var angleEach = (angleFull-5*angleGap)/6;

				for(var n=0;n<6;n++){
					var treatment_hr = treatment_day[n];
					if(Math.max.apply(null,treatment_hr)!=0){
						var arc_treat=d3.svg.arc()
							.outerRadius(treat_outerR+1/2*treat_width)
							.innerRadius(treat_outerR-1/2*treat_width)
							.startAngle(function(){
								if(j==0)return startAngle=0;
								else if(n==0) return startAngle=j*hosp_angleGap+j*hosp_angleEach;
								else return startAngle;
							})
							.endAngle(function(){
								if(j==0) return angleEach;
								else if(n==0) return j*hosp_angleGap+j*hosp_angleEach+angleEach;
								else return startAngle+angleEach;
							});
						d3.select("#patient_"+p_id).append("path")
							.attr("class","arc")
							.attr("d",arc_treat)
							.attr("fill",vis.treat_color[i])
							.attr("transform","translate("+d3.select("#patient_"+p_id).data()[0].radius+","+d3.select("#patient_"+p_id).data()[0].radius+")");
					}
					startAngle=startAngle+angleGap+angleEach;
				}
			}
			treat_outerR=treat_outerR-dot_width;
		}
		//draw mds
		var arc_border=d3.svg.arc()
			.outerRadius(treat_outerR)
			.innerRadius(treat_outerR-5*prop)
			.startAngle(0)
			.endAngle(2*Math.PI);
		d3.select("#patient_"+p_id).append("path")
				.attr("class","arc")
				.attr("d",arc_border)
				.attr("fill",vis.border_blue)
				.attr("transform","translate("+d3.select("#patient_"+p_id).data()[0].radius+","+d3.select("#patient_"+p_id).data()[0].radius+")");
		var mds_dots=d3.select("#patient_"+p_id).append('circle')
					.attr("class","mds")
					.attr("cx",d3.select("#patient_"+p_id).data()[0].radius)
					.attr("cy",d3.select("#patient_"+p_id).data()[0].radius)
					.attr("r",10*prop)
					.style("fill",vis.border_blue);
		return single;
	}
	function private_function1() {
		
	};
	
	function private_function2() {
		
	};
	
	function private_function3() {
		
	};
	
	return single;
};
