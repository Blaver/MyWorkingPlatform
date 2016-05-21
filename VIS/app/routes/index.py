import json
import os

from app import app
from flask import Flask, request

import API
from API import cluster_all

debug = False

@app.route('/')
def root():
	return app.send_static_file('index.html')

@app.route('/list')
def _list():
	datalist = [name for name in os.listdir("app/data")]
	
	if ".DS_Store" in datalist:
		datalist.remove(".DS_Store")
		
	return json.dumps(datalist)

@app.route('/data/<dataname>')
def _data(dataname):
	# data preprocessing
	fpath = r'D:\VIS\app\data\analysis_result_10.json'
	f=file(fpath)
	data=json.load(f)
	return json.dumps(data)

@app.route('/mdsdata/<dataname>')
def _mdsdata(dataname):
	# data preprocessing
	fpath = r'D:\VIS\app\data\analysis_result_1.json'
	f=file(fpath)
	data=json.load(f)
	return json.dumps(data)

@app.route('/rawdata/<dataname>')
def _rawdata(dataname):
	# data preprocessing
	fpath = r'D:\VIS\app\data\az_test2.json'
	f=file(fpath)
	data=json.load(f)
	return json.dumps(data)

@app.route('/merge_result/')
def _mergeresult():
	return json.dumps(cluster_all())
