# -*- coding: utf-8 -*-
"""
Created on Wed Apr 21 11:07:06 2016

@author: Blaver
"""
import numpy as np
import scipy.spatial.distance as ssd
from ctypes import *
import collections as cls
import time

item = cls.namedtuple('item', ['key', 'value'])

class TADPole(object):
    DTW = None
    def __init__(self):
        self.dll_config()
        self.UB_Matrix = None
        self.LB_Matrix = None
        self.Center_ = None
        self.Label_ = None
        
    def dll_config(self):
        TADPole.DTW = np.ctypeslib.load_library(r"D:\VIS\app\routes\DTW_DLL.dll", '.')     
        #dtw_c method setting
        TADPole.DTW.dtw_c.argtypes = [
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=2, flags="C_CONTIGUOUS"),
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=2, flags="C_CONTIGUOUS"),
            c_long,
            c_long,
            c_long,
            c_long
        ]
        TADPole.DTW.dtw_c.restype = c_double   
        #lb_keogh method setting
        TADPole.DTW.lb_keogh.argtypes = [
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=2, flags="C_CONTIGUOUS"),
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=2, flags="C_CONTIGUOUS"),
            c_long,
            c_long,
            c_long
        ]       
        TADPole.DTW.lb_keogh.restype = c_void_p
        #lb_keogh_md method setting
        TADPole.DTW.lb_keogh_md.argtypes = [
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=2, flags="C_CONTIGUOUS"),
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=3, flags="C_CONTIGUOUS"),
            c_long,
            c_long,
            c_long,
            c_long
        ]       
        TADPole.DTW.lb_keogh_md.restype = c_void_p
        #calc_rho method setting
        TADPole.DTW.calc_rho.argtypes = [
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=3, flags="C_CONTIGUOUS"),
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=2, flags="C_CONTIGUOUS"),
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=2, flags="C_CONTIGUOUS"),
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=1, flags="C_CONTIGUOUS"),
            c_long,
            c_long,
            c_long,
            c_long,
            c_double
        ]       
        TADPole.DTW.calc_rho.restype = c_void_p
        #prune_delta method setting
        TADPole.DTW.prune_delta.argtypes = [
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=3, flags="C_CONTIGUOUS"),
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=2, flags="C_CONTIGUOUS"),
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=2, flags="C_CONTIGUOUS"),
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=1, flags="C_CONTIGUOUS"),
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=1, flags="C_CONTIGUOUS"),
            np.ctypeslib.ndpointer(dtype=np.float64, ndim=1, flags="C_CONTIGUOUS"),
            c_long,
            c_long,
            c_long,
            c_long
        ]       
        TADPole.DTW.prune_delta.restype = c_void_p
        
    #this function uses some tricks :), but get a great speed-up!
    def calc_UB_Matrix(self, X):
        self.UB_Matrix = ssd.squareform(ssd.pdist(X.reshape(X.shape[0], -1)))
         
    def calc_LB_Matrix(self, X, w):
        self.LB_Matrix = np.zeros((X.shape[0], X.shape[0]))
        TADPole.DTW.lb_keogh_md(self.LB_Matrix, X, X.shape[2], X.shape[1], X.shape[0], w)
        #let LB_Matrix be symmetric
        self.LB_Matrix = np.max(np.array([self.LB_Matrix, self.LB_Matrix.T]), axis = 0)
        
    # WARNING: 'data' MUST be a 3D Matrix, please use recshape() to convert a 2D Matrix to 3D at first.       
    def clustering(self, data, n_cluster, dc, w):
        n_sample, n_dim, n_stamp = data.shape
        
        if n_sample <= n_cluster:
            self.Center_ = np.array(range(n_sample))
            self.Label_ = np.array(range(n_sample))
            return
        
        t = time.clock()
        #calculate LB and UB matrix.
        self.calc_LB_Matrix(data, w)
        self.calc_UB_Matrix(data)
        
        t1 = time.clock()
        #calculate rho for each data point.        
        rhos = np.zeros(n_sample)
        TADPole.DTW.calc_rho(data, self.UB_Matrix, self.LB_Matrix, rhos, n_sample, n_dim, n_stamp, w, dc)
        t2 = time.clock()
        
        #print rhos
        # Normalize rhos        
        r_min, r_max = rhos.min(), rhos.max()
        if r_min == r_max:
            rhos = np.ones(n_sample, dtype = np.float64)
        else:
            rhos = (rhos - r_min)/(r_max - r_min)
        
        #sort rho    
        args = np.argsort(rhos)
        Rhos = np.array([args, rhos[args]])
        
        #Phase1: calculate upperbound matrix of delta
        # I use optimal way to implement it and get 30 times speed-up.
        UB_Delta = np.zeros(n_sample)
        for i in range(n_sample - 1):    
            UB_Delta[i] = np.min(self.UB_Matrix[Rhos[0, i].astype(np.int64), Rhos[0, range(i + 1, n_sample)].astype(np.int64)])               
        t3 = time.clock()
        
        #Phase2: pruning 
        #(also use some tricks, achieve lesser number of 'if' branches than original paper)
        Delta = UB_Delta
        D_Index = np.zeros(n_sample) - 1
        TADPole.DTW.prune_delta(data, self.UB_Matrix, self.LB_Matrix, Rhos[0,:], Delta, D_Index, n_sample, n_dim, n_stamp, w)
        Delta[n_sample - 1] = np.max(Delta) 
        t4 = time.clock()

        # Normalize Delta        
        D_min, D_max = Delta.min(), Delta.max()
        if D_min == D_max:
            Delta = np.ones(n_sample, dtype = np.float64)
        else:
            Delta = (Delta - D_min)/(D_max - D_min)
        
        #calculate Gamma and sort it in descending order
        Gamma = [item(Rhos[0, i], Rhos[1, i]*Delta[i]) for i in range(n_sample)]
        Gamma.sort(key = lambda x:x.value, reverse = True)
        
        #find out clustering centers        
        self.Center_ = np.array(Gamma)[range(n_cluster), 0].T
        
        #assign labels of clustering centers 
        self.Label_ = np.zeros(n_sample, dtype = np.int64) - 1
        self.Label_[self.Center_.astype(np.int64)] = range(n_cluster)
        
        #assign labels of other sample-points 
        for i in range(2, n_sample + 1):
            i_ind = Rhos[0, -i]
            j_ind = D_Index[-i]
            if self.Label_[i_ind] == -1:
                self.Label_[i_ind] = self.Label_[j_ind]
        
#==============================================================================
# #below is testing code        
#==============================================================================        
        t5 = time.clock()

#==============================================================================
#         print self.Center_
#         print np.array(Gamma)[range(20), 1]
#==============================================================================
        print (t5 - t4), (t4-t3), (t3-t2), (t2-t1), (t1-t)






    
    