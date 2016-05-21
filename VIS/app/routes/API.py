# -*- coding: utf-8 -*-
"""
Created on Fri May 06 21:14:11 2016

@author: Blaver
"""
from sklearn.manifold import MDS, TSNE
import TADPole as tadp
from sklearn import preprocessing as pp
import PreProcessingAPI as ppa
import numpy as np
import json
import time
from ctypes import *

patients = {}
medicines = []
lab_tests = []

seg_temperatures = None
seg_treatments = None

id2index = {}
index2id = {}

def load_data():
    global patients, medicines, lab_tests 
    
    json_data = json.load(open(r'D:\VIS\app\data\data_all.json')) 
    patients  = json_data['patients']
    medicines = json_data['medicines']
    lab_tests = json_data['lab_tests']
    
def id_mapping():
    global id2index, index2id
    
    for i, (k, v) in enumerate(patients.items()):
        id2index[k] = i
        index2id[i] = k
        
def segmentation_T(n_seg = 30):
    global seg_temperatures, patients
    n_sample = len(patients)
    
    temperatures = []
    for (pid, record) in patients.items():
        temperatures.append(ppa.continuous_segmentation(record['temperatures'], n_seg))    
    seg_temperatures = np.array(temperatures).reshape((n_sample, 1, -1))

def segmentation_M(n_seg = 48, delay_len = 1.0):
    global seg_treatments, patients

    treatments = []
    for (pid, record) in patients.items():
        individual_treatment = []
        start = record['in_date']
        end = record['out_date']
        for dim in record['treatments']:
            individual_treatment.append(ppa.event_segmentation(dim, n_seg, delay_len, (start, end)))
        treatments.append((individual_treatment))

    seg_treatments = np.array(treatments)
    
def temperature_clustering(PID, dc, n_cluster = 8, r = 0.2, t_start = 0.0, t_end = 1.0):
    n_seg = seg_temperatures.shape[2]
    seg_start = int(t_start*n_seg)
    seg_end = int(np.ceil(t_end*n_seg))
    
    w = int(np.ceil(n_seg*r))
    if w < 1 or w > n_seg:
        w = -1
        
    indices = [id2index[pid] for pid in PID]
    X = seg_temperatures[indices, :, :][:, :, range(seg_start, seg_end)]
    X = pp.scale(X.reshape((X.shape[0], X.shape[2])), axis = 1).reshape(X.shape)

    t = tadp.TADPole()
    t.clustering(X, n_cluster, dc, w)
    
    centers = np.array(indices)[t.Center_.astype(np.int64)]
    centers = [index2id[c] for c in centers]
    labels = t.Label_
    
#==============================================================================
#     import matplotlib.pyplot as mpl
#     for i, c in enumerate(t.Center_):
#         ax =  mpl.subplot(np.ceil(len(t.Center_)/2.0), 2, i + 1)
#         ax.plot(X[c,:,:].reshape(30)) 
#     mpl.show()
#============================================================================== 
    return centers, labels

def treatment_clustering(PID, m_indices, dc, t_start = 0.0, t_end = 1.0, n_cluster = 3, r = 0.15):
    n_seg = seg_treatments.shape[2]
    seg_start = int(np.floor(t_start*n_seg))
    seg_end = int(np.ceil(t_end*n_seg))
    
    w = int(np.ceil(n_seg*r))
    if w < 1 or w > n_seg:
        w = -1
    
    p_indices = [id2index[pid] for pid in PID]
    X = seg_treatments[p_indices, :, :][:, m_indices, :][:, :, range(seg_start, seg_end)]
    
    for dim in range(X.shape[1]):
        X[:, dim, :] = pp.scale(X[:, dim, :], axis = 1)
    X = np.require(X, dtype=np.float64, requirements = 'C')
      
    t = tadp.TADPole()
    t.clustering(X, n_cluster, dc, w)
    
    centers = np.array(p_indices)[t.Center_.astype(np.int64)]
    centers = [index2id[c] for c in centers]
    labels = t.Label_

    return centers, labels
    
def labtest_MDS(PID):
    data = [patients[pid]['tests'] for pid in PID]
    X = pp.scale(data)
    mds = MDS(n_components = 2, metric = True, n_init = 4, max_iter = 300, verbose = 0, eps = 0.001, n_jobs = 1, dissimilarity = 'euclidean')
    pos = mds.fit(X).embedding_
    
    return pos
    
def labtest_TSNE(PID):
    data = [patients[pid]['tests'] for pid in PID]
    X = pp.scale(data)
    tsne = TSNE(n_components=2, perplexity=30.0, learning_rate=1000.0, n_iter=1000, n_iter_without_progress=30, min_grad_norm=1e-07, angle=0.5)
    pos = tsne.fit(X).embedding_
    
    return pos
    
def oneKey_clustering(PID = [], MID = [], tdc = 1.75, mdc = 5.0, nt_cluster = 15, nm_cluster = 3, t_start = 0.0, t_end = 1.0, tr = 0.1, mr = 0.1, WRITE = False):
    #init default parameters    
    if len(PID) == 0:
        PID = patients.keys()
    if len(MID) == 0:
        MID = range(len(medicines))
    
    #temperature clustering    
    t_centers, t_labels = temperature_clustering(PID, tdc, nt_cluster, tr, t_start, t_end)
    
    #set up cohort for each cluster
    t_cohorts = [[] for tc in t_centers]
    for i, pid in enumerate(patients.keys()):
        t_cohorts[t_labels[i]].append(pid)    
    
    #res_cluster is the result that would be returned
    res_clusters = []
    for i, cohort in enumerate(t_cohorts):
        cluster = dict()
        cluster['id'] = i
        cluster['cohort'] = cohort
        cluster['aligned_temperature'] = seg_temperatures[id2index[t_centers[i]], 0, :].tolist()
        cluster['raw_temperature'] = patients[t_centers[i]]['temperatures']
        cluster['treatment_clusters'] = []
        
        #treatment clustering for each cohort
        m_centers, m_labels = treatment_clustering(cohort, MID, mdc, t_start, t_end, nm_cluster, mr)
        
        #set up cohort according to the way of treatment for each cluster
        m_cohorts = [[] for mc in m_centers]        
        for j, pid in enumerate(cohort):
            m_cohorts[m_labels[j]].append(pid) 
        
        #recording treatment-clustering result         
        for j, m_cohort in enumerate(m_cohorts):
            m_cluster = dict()
            m_cluster['id'] = j
            m_cluster['cohort'] = m_cohort
            m_cluster['aligned_treatments'] = seg_treatments[id2index[m_centers[j]], :, :].tolist()
            m_cluster['raw_treatments'] = patients[m_centers[j]]['treatments']
            
            cluster['treatment_clusters'].append(m_cluster)
        
        #results of lab-test MDS and t-SNE
        cluster['lab_coordinates'] = labtest_MDS(cohort).tolist()
        #cluster['lab_coordinates_TSNE'] = labtest_TSNE(cohort).tolist()
        
        res_clusters.append(cluster)
       
    if WRITE:
        json.dump({"clusters" : res_clusters}, open('clustering_result.json', 'w'))
    
    return res_clusters
        
def cluster_all():
	load_data()
	id_mapping()
	segmentation_T(30)
	segmentation_M()
	result=oneKey_clustering()
	return result

#t = time.clock()
#==============================================================================
# centers, labels = temperature_clustering(patients.keys(), 1.75, 7)
# #centers, labels = treatment_clustering(patients.keys(), range(24), 6.0)
# t1 = time.clock()
# 
# cluster_lists = [[] for c in centers]
# for i, pid in enumerate(patients.keys()):
#     cluster_lists[labels[i]].append(pid)
# 
# #==============================================================================
# # for cluster_list in cluster_lists:
# #     coos = labtest_MDS(cluster_list)
# #     mpl.scatter(coos[:, 0], coos[:, 1])
# # mpl.show()
# #==============================================================================
# coos = labtest_MDS(patients.keys())
# mpl.scatter(coos[:, 0], coos[:, 1])
# mpl.show() 
#==============================================================================
#print t1 - t
#==============================================================================
# import matplotlib.pyplot as mpl
# for i, c in enumerate(centers):
#     ax =  mpl.subplot(np.ceil(len(centers)/2.0), 2, i + 1)
#     ax.plot(seg_temperatures[c,:,:].reshape(30)) 
# mpl.show()
#==============================================================================
    

