/*
	System Driver
	Author : Nan Cao (nancao.org)
*/
var component = vis.component().size([970, 590]);
var horizonal = vis.horizonal().size([960,230]);
var mds=vis.mds().size([303,303]);
var scatterplot=vis.scatterplot().size([303,303]);
var rawdata=vis.rawdata().size([300,508]);
var heatmap=vis.heatmap().size([960,230]);
var targetvue=vis.targetvue().size([970,590]);
var single=vis.single().size([970,590]);

// layout UI and setup events
$(document).ready(function() {
	// init data list
	$.get("/list", function(d) {
		$("#dataset").empty();
		d = $.parseJSON(d);
		d.forEach(function(name) {
			$("#dataset").append(
				"<option>" + name + "</option>"
			);
		});
		display();
	});
	$("#tabs").tabs();
	$("#tablists").tabs();
	$("#tabmain").tabs();
	$("#mainview2").hide();
	$("#mainview3").hide();
	$("#dataset").hide();
	
	$("#radio1").click(function(){
		$("#mainview").show();
		$("#mainview2").hide();
		$("#mainview3").hide();
	});
	$("#radio2").click(function(){
		$("#mainview").hide();
		$("#mainview2").show();
		$("#mainview3").hide();
	});
	$("#radio3").click(function(){
		$("#mainview").hide();
		$("#mainview2").hide();
		$("#mainview3").show();
	});
	wire_events();
});

//////////////////////////////////////////////////////////////////////
// local functions
function wire_events() {
};

function display() {
	// clean contents
	d3.select("#view").selectAll("*").remove();
	
	// load datasets
	var data = $('#dataset').val();
	if(!data || data == '') {
		return;
	}
	
	component.container(d3.select("#mainview").append("svg"));
	var svg = d3.select("#mainview").select("svg");
		svg.attr("width","100%")
			.attr("height","100%");
	
	horizonal.container(d3.select("#hview1").append("svg"));
	var svg_hor = d3.select("#hview1").select("svg");
		svg_hor.attr("width","100%")
				.attr("height","100%");		
	
	mds.container(d3.select("#sview1").append("svg"));
	var svg_mds = d3.select("#sview1").select("svg");
		svg_mds.attr("width","100%");
		svg_mds.attr("height","100%");
		
	targetvue.container(d3.select("#mainview2").append("svg"));
	var svg_vue = d3.select("#mainview2").select("svg");
		svg_vue.attr("width","100%")
			.attr("height","100%");
			
	single.container(d3.select("#mainview3").append("svg"));
	var svg_single = d3.select("#mainview3").select("svg");
		svg_single.attr("width","100%")
			.attr("height","100%");
	
	// scatterplot.container(d3.select("#sview2").append("svg"));
	// var svg_scatterplot=d3.select("#sview2").select("svg");
		// svg_scatterplot.attr("width",290);
		// svg_scatterplot.attr("height",290);
		
	rawdata.container(d3.select("#accordion"));
	
	heatmap.container(d3.select("#hview2").append("svg"));
	var svg_heat = d3.select("#hview2").select("svg");
		svg_heat.attr("width","100%")
				.attr("height","100%");		
			
	var url_main = "data/analysis_result_10";
	d3.json(url_main, function(error, json_main) {
		if (error) {
			console.log(error);
			return;
		}
		component.data(json_main).layout().render();
		targetvue.data(json_main).layout().render();
		horizonal.data(json_main).layout().render();
		heatmap.data(json_main).layout().render();
	});
	
	var url_mds = "mdsdata/analysis_result_1";
	d3.json(url_mds, function(error, json_mds) {
		if (error) {
			console.log(error);
			return;
		}
		mds.data(json_mds.clusters[0].lab_coordinates2).layout().render();
	});
	
	var url_mergeresult="merge_result/";
	d3.json(url_mergeresult, function(error, json_merge) {
		if (error) {
			console.log(error);
			return;
		}
		scatterplot.data(json_merge).layout().render();
	});
	
	var url_rawdata = "rawdata/az_test2";
	d3.json(url_rawdata, function(error, json_rawdata) {
		if (error) {
			console.log(error);
			return;
		}
		rawdata.data(json_rawdata).render();
		single.data(json_rawdata).layout().render();
		$(function() {
   	 		$( "#accordion" ).accordion();
  		});
  		// jQuery(document).ready(function(){
			// var accordionsMenu = $('.cd-accordion-menu');
			// if( accordionsMenu.length > 0 ) {
				// accordionsMenu.each(function(){
					// var accordion = $(this);
				// //detect change in the input[type="checkbox"] value
					// accordion.on('change', 'input[type="checkbox"]', function(){
						// var checkbox = $(this);
						// console.log(checkbox.prop('checked'));
						// (checkbox.prop('checked') ) ? checkbox.siblings('ul').attr('style', 'display:none;').slideDown(300) : checkbox.siblings('ul').attr('style', 'display:block;').slideUp(300);
					// });
			// });
			// }
		// });
	});
};
	
