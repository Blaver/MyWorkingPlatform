# -*- coding: utf-8 -*-
"""
Created on Tue May 10 14:29:20 2016

@author: Blaver
"""
import numpy as np
   
#==============================================================================
# NOTICE:
# Struct of data:
#     a list that each item is like (temprature, time_stamp) and sorted 
#     by time_stamp in ascending order.
#==============================================================================
def continuous_segmentation(data, K, endpoint = None):
    if not endpoint == None:
        start, end = endpoint
    else:
        start, end = data[0][1], data[-1][1]
    
    step = (end - start)/K
    buckets = [[] for i in range(K)]
    
    pre_i = -1
    for (value, stamp) in data:
        #push t-record into right bucket
        cur_i = int(min(K - 1, (stamp-start)/step))
        buckets[cur_i].append(value)
        
        #if skip some buckets, we should do a 'relaxed' linear-interpolate to fill it
        if cur_i - pre_i > 1:
            v_start = buckets[pre_i][-1]
            step_len = (value - v_start)/(cur_i - pre_i)
            for i in range(pre_i + 1, cur_i):
                buckets[i].append(v_start + step_len*(i - pre_i))
        pre_i = cur_i
            
    result = np.array([np.array(b).mean() for b in buckets])
    return result

    
def event_segmentation(data, K, delay_len, endpoint = None):
    #NOTICE: this initialize line only valid for non-negative data
    buckets = np.zeros(K)
    
    if len(data) == 0:
        return buckets
        
    if not endpoint == None:
        start, end = endpoint
    else:
        start, end = data[0][1], data[-1][1]
        
    #time interval of single segment
    step = (end - start)/K
    #number of delay segments
    n_delay = int(delay_len/step)

    pre_i = -1
    for (value, stamp) in data:
        #push t-record into right bucket
        #notice that we only need the maximum value, this is like a MAX-POOLING
        cur_i = int(min(K - 1, (stamp-start)/step))
        buckets[cur_i] = max(buckets[cur_i], value)
        
        interval = (cur_i - pre_i)       
        #if skip some buckets, we should do a 'bias' UP-SAMPLE to fill it
        if interval > 1:
            window_end = min(n_delay, interval)
            filled_v = buckets[pre_i]/interval
            for i in range(0, window_end):
                buckets[pre_i + i] = filled_v
        pre_i = cur_i
        
    return buckets
        
    
        
        
    