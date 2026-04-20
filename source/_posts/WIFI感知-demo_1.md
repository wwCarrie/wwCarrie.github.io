---
title: demo_1 速率
date: 2024-08-06 15:12:33
tags: WIFI感知
password: 785425
abstract: 速率demo
categories: [科研笔记]
message: 您好, 该文章仅供博主阅览。
theme: flip
wrong_pass_message: 抱歉，还在改进，不便查看。
---

该demo用于计算呼吸速率，主要讲一些名词解释和关键点。

[参照](https://blog.csdn.net/Acecai01/article/details/130564006?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522172292657716800185857301%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=172292657716800185857301&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-130564006-null-null.142^v100^pc_search_result_base4&utm_term=%E5%9F%BA%E4%BA%8EWIFI%E7%9A%84CSI%E6%95%B0%E6%8D%AE&spm=1018.2226.3001.4187)

---

1. 收取数据
2. 读取最新的.dat数据文件，解析出csi数据；
3. 计算csi的振幅和相位，并对相位数据进行校准；
4. 对振幅和相位数据进行中值滤波；
5. 基于EMD 算法滤波；
6. 基于FFT进行子载波筛选；
7. 基于CA-CFAR寻峰算法进行寻峰和呼吸速率统计；

---
原理

---
实操

### 前期

[PyEMD 的pip](https://blog.csdn.net/weixin_44602176/article/details/114698584)


#### 原版
```python
# -*-coding:utf-8-*-
# -*-coding:utf-8-*-
import os
import time
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
# csi各种处理，参考宝藏工具：https://github.com/citysu/csiread
import csiread  # csiread/examples/csishow.py这里好多处理csi的基本操作，处理幅值和相位等等
import scipy.signal as signal
from PyEMD import EMD  #pip install EMD-signal
from scipy.fftpack import fft

# -----------------------------------------------求振幅和相位
# 参考：https://github.com/citysu/csiread 中utils.py和csishow.py
def scidx(bw, ng, standard='n'):
    """subcarriers index

    Args:
        bw: bandwitdh(20, 40, 80)
        ng: grouping(1, 2, 4)
        standard: 'n' - 802.11n， 'ac' - 802.11ac.
    Ref:
        1. 802.11n-2016: IEEE Standard for Information technology—Telecommunications
        and information exchange between systems Local and metropolitan area
        networks—Specific requirements - Part 11: Wireless LAN Medium Access
        Control (MAC) and Physical Layer (PHY) Specifications, in
        IEEE Std 802.11-2016 (Revision of IEEE Std 802.11-2012), vol., no.,
        pp.1-3534, 14 Dec. 2016, doi: 10.1109/IEEESTD.2016.7786995.
        2. 802.11ac-2013 Part 11: ["IEEE Standard for Information technology--
        Telecommunications and information exchange between systemsLocal and
        metropolitan area networks-- Specific requirements--Part 11: Wireless
        LAN Medium Access Control (MAC) and Physical Layer (PHY) Specifications
        --Amendment 4: Enhancements for Very High Throughput for Operation in
        Bands below 6 GHz.," in IEEE Std 802.11ac-2013 (Amendment to IEEE Std
        802.11-2012, as amended by IEEE Std 802.11ae-2012, IEEE Std 802.11aa-2012,
        and IEEE Std 802.11ad-2012) , vol., no., pp.1-425, 18 Dec. 2013,
        doi: 10.1109/IEEESTD.2013.6687187.](https://www.academia.edu/19690308/802_11ac_2013)
    """

    PILOT_AC = {
        20: [-21, -7, 7, 21],
        40: [-53, -25, -11, 11, 25, 53],
        80: [-103, -75, -39, -11, 11, 39, 75, 103],
        160: [-231, -203, -167, -139, -117, -89, -53, -25, 25, 53, 89, 117, 139, 167, 203, 231]
    }
    SKIP_AC_160 = {1: [-129, -128, -127, 127, 128, 129], 2: [-128, 128], 4: []}
    AB = {20: [28, 1], 40: [58, 2], 80: [122, 2], 160: [250, 6]}
    a, b = AB[bw]

    if standard == 'n':
        if bw not in [20, 40] or ng not in [1, 2, 4]:
            raise ValueError("bw should be [20, 40] and ng should be [1, 2, 4]")
        k = np.r_[-a:-b:ng, -b, b:a:ng, a]
    if standard == 'ac':
        if bw not in [20, 40, 80] or ng not in [1, 2, 4]:
            raise ValueError("bw should be [20, 40, 80] and ng should be [1, 2, 4]")

        g = np.r_[-a:-b:ng, -b]
        k = np.r_[g, -g[::-1]]

        if ng == 1:
            index = np.searchsorted(k, PILOT_AC[bw])
            k = np.delete(k, index)
        if bw == 160:
            index = np.searchsorted(k, SKIP_AC_160[ng])
            k = np.delete(k, index)
    return k

def calib(phase, k, axis=1):
    """Phase calibration

    Args:
        phase (ndarray): Unwrapped phase of CSI.
        k (ndarray): Subcarriers index
        axis (int): Axis along which is subcarrier. Default: 1

    Returns:
        ndarray: Phase calibrated

    ref:
        [Enabling Contactless Detection of Moving Humans with Dynamic Speeds Using CSI]
        (http://tns.thss.tsinghua.edu.cn/wifiradar/papers/QianKun-TECS2017.pdf)
    """
    p = np.asarray(phase)
    k = np.asarray(k)

    slice1 = [slice(None, None)] * p.ndim
    slice1[axis] = slice(-1, None)
    slice1 = tuple(slice1)
    slice2 = [slice(None, None)] * p.ndim
    slice2[axis] = slice(None, 1)
    slice2 = tuple(slice2)
    shape1 = [1] * p.ndim
    shape1[axis] = k.shape[0]
    shape1 = tuple(shape1)

    k_n, k_1 = k[-1], k[0]   # 这里本人做了修改，将k[1]改成k[0]了
    a = (p[slice1] - p[slice2]) / (k_n - k_1)
    b = p.mean(axis=axis, keepdims=True)
    k = k.reshape(shape1)

    phase_calib = p - a * k - b
    return phase_calib

# -----------------------------------------------EMD分解，去除高频噪声
# 参考：https://blog.csdn.net/fengzhuqiaoqiu/article/details/127779846
# 参考：基于WiFi的人体行为感知技术研究（南京邮电大学的一篇硕士论文）
def emd_and_rebuild(s):
    '''对信号s进行emd分解，去除前2个高频分量后，其余分量相加重建新的低频信号'''
    emd = EMD()
    imf_a = emd.emd(s)

    # 去掉前3个高频子信号，合成新低频信号
    new_s = np.zeros(s.shape[0])
    for n, imf in enumerate(imf_a):
        # 注意论文中是去除前2个，本人这里调整为去除前3个高频分量
        if n < 3:  
            continue
        new_s = new_s + imf
    return new_s

# -----------------------------------------------FFT变换筛选子载波
# 参考：https://blog.csdn.net/zhengyuyin/article/details/127499584
# 参考：基于WiFi的人体行为感知技术研究（南京邮电大学的一篇硕士论文）
def dft_amp(signal):
    '''求离散傅里叶变换的幅值'''
    # dft后，长度不变，是复数表示，想要频谱图需要取模
    dft = fft(signal)
    dft = np.abs(dft)
    return dft

def respiration_freq_amp_ratio(dft_s, st_ix, ed_ix):
    '''计算呼吸频率范围内的频率幅值之和,与全部频率幅值之和的比值
    dft_s: 快速傅里叶变换后的序列幅值
    st_ix: 呼吸频率下限的序号
    ed_ix: 呼吸频率上限的序号
    '''
    return np.sum(dft_s[st_ix:ed_ix])/np.sum(dft_s)

# ----------------------------------------------------------------------------- 均值恒虚警（CA-CFAR）
# 参考：https://github.com/msvorcan/FMCW-automotive-radar/blob/master/cfar.py
# 参考：基于WiFi的人体行为感知技术研究（南京邮电大学的一篇硕士论文）
def detect_peaks(x, num_train, num_guard, rate_fa):
    """
    Parameters
    ----------
    x : signal，numpy类型
    num_train : broj trening celija, 训练单元数
    num_guard : broj zastitnih celija，保护单元数
    rate_fa : ucestanost laznih detekcija，误报率

    Returns
    -------
    peak_idx : niz detektovanih meta
    """
    num_cells = len(x)
    num_train_half = round(num_train / 2)
    num_guard_half = round(num_guard / 2)
    num_side = num_train_half + num_guard_half

    alpha = 0.09 * num_train * (rate_fa ** (-1 / num_train) - 1)  # threshold factor

    peak_idx = []
    for i in range(num_side, num_cells - num_side):

        if i != i - num_side + np.argmax(x[i - num_side: i + num_side + 1]):
            continue

        sum1 = np.sum(x[i - num_side: i + num_side + 1])
        sum2 = np.sum(x[i - num_guard_half: i + num_guard_half + 1])
        p_noise = (sum1 - sum2) / num_train
        threshold = alpha * p_noise

        if x[i] > threshold and x[i] > -20:
            peak_idx.append(i)

    peak_idx = np.array(peak_idx, dtype=int)
    return peak_idx


if __name__ == '__main__':
    fs = 20  # 呼吸数据的采样率，设置为20Hz,数据包速率大于这个数的要进行下采样
    tx_num = 3
    rx_num = 3
    bpm_count_num = rx_num * tx_num * 2 * 10  # 理想情况下需要累加的呼吸速率个数

    is_sample = True   # 是否需要下采样
    sample_gap = 5     # 需要下采样则设置取数间隔

    # data_pt = 'E:/WiFi/test/data/csi_data/'
    data_pt = './data/pc3.dat'

    while True:
        # 由于采数的shell脚本是不断产生30秒的数据文件的，为了不让数据文件撑爆硬盘，这里每次进入循环都要先删除多余的数据
        # 文件，留下最新的两个数据文件，因数据文件名是按整数来命名且依次递增的，文件名最大的两个文件是最新的文件。
        all_fl = sorted([int(item.split('.')[0]) for item in os.listdir(data_pt)])
        if len(all_fl)<2:
            time.sleep(2)
            continue
        for i in range(len(all_fl)-2):
            os.remove(data_pt+str(all_fl[i])+'.dat')
            
        # 取倒数第2个文件而不是最新的文件，可以确保拿到的文件已经采满30秒，而最新的数据文件可能正在写入数据。
        csifile = data_pt + str(all_fl[-2])+'.dat'  
        print('\n', csifile)
        
        csidata = csiread.Intel(csifile, nrxnum=rx_num, ntxnum=tx_num, pl_size=10)
        csidata.read()
        csi = csidata.get_scaled_csi()
        print(csi.shape)

        # 等间隔抽样，为了将数据采样成20Hz，比如本人设置的发包率为100，那么sample_gap=5就可以降采样成20Hz
        if is_sample:
            csi = csi[0:-1:sample_gap,:,:,:]  
            print(csi.shape)


        # 振幅和相位计算
        csi_amplitude = np.abs(csi)                    # 求csi值的振幅
        csi_phase = np.unwrap(np.angle(csi), axis=1)   # 求csi值的相位
        csi_phase = calib(csi_phase, scidx(20, 2))     # 校准相位的值
        # print('csi_phase: ', csi_phase[:2, 1, 2, 1])

        # 中值滤波，去除异常点
        # 参考：https://blog.csdn.net/qq_38251616/article/details/115426742
        csi_amplitude_filter = np.apply_along_axis(signal.medfilt, 0, csi_amplitude.copy(), 3)   # 中值滤波,窗口必须为奇数，此处窗口为3
        csi_phase_filter = np.apply_along_axis(signal.medfilt, 0, csi_phase.copy(), 3)    # 中值滤波,窗口必须为奇数，此处窗口为3
        # print('csi_phase_filter: ', csi_phase_filter[:2, 1, 2, 1])

        # csi_amplitude_filter = csi_amplitude_filter[0:-1:5, :, :, :]
        # csi_phase_filter = csi_phase_filter[0:-1:5, :, :, :]
        # print(csi_phase_filter.shape)


        # emd分解信号-重建信号
        csi_amplitude_emd = np.apply_along_axis(emd_and_rebuild, 0, csi_amplitude_filter.copy())
        csi_phase_emd = np.apply_along_axis(emd_and_rebuild, 0, csi_phase_filter.copy())
        # print('csi_phase_emd: ', csi_phase_emd[:2, 1, 2, 1])


        # 基于振幅的fft变换筛选子载波，并针对挑选出的子载波进行寻峰和呼吸速率计算
        csi_dft_amp = np.apply_along_axis(dft_amp, 0, csi_amplitude_emd.copy())

        n = csi_dft_amp.shape[0]  # 采样点数
        # 0.15Hz对应dft中值的序号,呼吸频率下限
        l_ix = int(0.15*n/fs)
        # 0.5Hz对应dft中值的序号,呼吸频率上限
        u_ix = int(0.5*n/fs)+1
        # 计算呼吸频率值的占比
        csi_respiration_freq_ratio = np.apply_along_axis(respiration_freq_amp_ratio, 0, csi_dft_amp.copy(),l_ix, u_ix)
        # 针对1发1收对应的30个载波筛选出10个载波，进行呼吸频率计算
        sum_bpm = 0
        bpm_count = 0
        all_respiration_freq_ratio = 0
        for i in range(csi_respiration_freq_ratio.shape[1]):
            for j in range(csi_respiration_freq_ratio.shape[2]):
                temp = np.sort(csi_respiration_freq_ratio[:,i,j])
                for k in range(30):
                    if csi_respiration_freq_ratio[k,i,j] < temp[20]:  # 排名前10的才会进入下面的计算,如果temp[19]==temp[20]就会多出来一个
                        continue

                    amplitude_peak_idx = detect_peaks(csi_amplitude_emd[:, k, i, j].copy(), num_train=20, num_guard=8, rate_fa=1e-3)
                    phase_peak_idx = detect_peaks(csi_phase_emd[:, k, i, j].copy(), num_train=20, num_guard=8, rate_fa=1e-3)
                    amplitude_bpm = 0
                    phase_bpm = 0
                    try:
                        # 基于振幅计算的每秒呼吸次数
                        amplitude_bpm = (len(amplitude_peak_idx)-1)*fs/(amplitude_peak_idx[-1]-amplitude_peak_idx[0])
                        # 基于相位计算的每秒呼吸次数
                        phase_bpm = (len(phase_peak_idx)-1)*fs/(phase_peak_idx[-1]-phase_peak_idx[0])
                        # 呼吸心率必须大于1分钟9次
                        if ~pd.isna(amplitude_bpm) and ~pd.isna(phase_bpm) and amplitude_bpm > 0.15 and phase_bpm > 0.15:
                            sum_bpm = sum_bpm + amplitude_bpm + phase_bpm
                            bpm_count = bpm_count + 2
                            all_respiration_freq_ratio = all_respiration_freq_ratio + csi_respiration_freq_ratio[k,i,j]
                            # print(i, j, k, bpm_count)
                    except:
                        pass
                    # print(i, j, k, amplitude_bpm, phase_bpm)
        mean_respiration_freq_ratio = all_respiration_freq_ratio/bpm_count   # 呼吸频率范围的平均频率值
        print(bpm_count_num, bpm_count, round(mean_respiration_freq_ratio,4))
        # 下面的两个阈值需针对不同设备自行调整，本人自行采集了几个站位和静坐的数据以及几个无人情况下的数据，进行分析得出
        # 区分有人和无人的阈值
        if bpm_count/bpm_count_num > 0.7 and mean_respiration_freq_ratio > 0.03:  
            mean_bpm = sum_bpm / bpm_count
            print('rate ：', int(mean_bpm*60), '次/分钟')
        else:
            print('无人！')
```

#### 修改版1

```python
# -*-coding:utf-8-*-
# -*-coding:utf-8-*-
import os
import time
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
# csi各种处理，参考宝藏工具：https://github.com/citysu/csiread
import csiread  # csiread/examples/csishow.py这里好多处理csi的基本操作，处理幅值和相位等等
import scipy.signal as signal
from PyEMD import EMD  # pip install EMD-signal
from scipy.fftpack import fft


# -----------------------------------------------求振幅和相位
# 参考：https://github.com/citysu/csiread 中utils.py和csishow.py
def scidx(bw, ng, standard='n'):
    """subcarriers index 子载波索引

    Args:
        bw: bandwitdh(20, 40, 80) 带宽，支持20，40，80和160Mhz
        ng: grouping(1, 2, 4)         组数：支持1，2，和4
        standard: 'n' - 802.11n， 'ac' - 802.11ac. 可以为 802.11n 或者 802.11ac
    Ref:
        1. 802.11n-2016: IEEE Standard for Information technology—Telecommunications
        and information exchange between systems Local and metropolitan area
        networks—Specific requirements - Part 11: Wireless LAN Medium Access
        Control (MAC) and Physical Layer (PHY) Specifications, in
        IEEE Std 802.11-2016 (Revision of IEEE Std 802.11-2012), vol., no.,
        pp.1-3534, 14 Dec. 2016, doi: 10.1109/IEEESTD.2016.7786995.
        2. 802.11ac-2013 Part 11: ["IEEE Standard for Information technology--
        Telecommunications and information exchange between systemsLocal and
        metropolitan area networks-- Specific requirements--Part 11: Wireless
        LAN Medium Access Control (MAC) and Physical Layer (PHY) Specifications
        --Amendment 4: Enhancements for Very High Throughput for Operation in
        Bands below 6 GHz.," in IEEE Std 802.11ac-2013 (Amendment to IEEE Std
        802.11-2012, as amended by IEEE Std 802.11ae-2012, IEEE Std 802.11aa-2012,
        and IEEE Std 802.11ad-2012) , vol., no., pp.1-425, 18 Dec. 2013,
        doi: 10.1109/IEEESTD.2013.6687187.](https://www.academia.edu/19690308/802_11ac_2013)
    """

    import numpy as np

    PILOT_AC = {
        20: [-21, -7, 7, 21],
        40: [-53, -25, -11, 11, 25, 53],
        80: [-103, -75, -39, -11, 11, 39, 75, 103],
        160: [-231, -203, -167, -139, -117, -89, -53, -25, 25, 53, 89, 117, 139, 167, 203, 231]
    }
    SKIP_AC_160 = {1: [-129, -128, -127, 127, 128, 129], 2: [-128, 128], 4: []}
    AB = {20: [28, 1], 40: [58, 2], 80: [122, 2], 160: [250, 6]}
    a, b = AB[bw]

    if standard == 'n':
        if bw not in [20, 40] or ng not in [1, 2, 4]:
            raise ValueError("带宽必须是 [20, 40] 且分组方式必须是 [1, 2, 4]")
        k = np.r_[-a:-b:ng, -b, b:a:ng, a]
    if standard == 'ac':
        if bw not in [20, 40, 80] or ng not in [1, 2, 4]:
            raise ValueError("带宽必须是 [20, 40, 80] 且分组方式必须是 [1, 2, 4]")

        g = np.r_[-a:-b:ng, -b]
        k = np.r_[g, -g[::-1]]

        if ng == 1:
            index = np.searchsorted(k, PILOT_AC[bw])
            k = np.delete(k, index)
        if bw == 160:
            index = np.searchsorted(k, SKIP_AC_160[ng])
            k = np.delete(k, index)
    return k


def calib(phase, k, axis=1):
    """Phase calibration 相位校准

    Args:
        phase (ndarray): Unwrapped phase of CSI. 已经展开的CSI相位
        k (ndarray): Subcarriers index 子载波索引
        axis (int): Axis along which is subcarrier. Default: 1 子载波所在的轴，默认值为1

    Returns:
        ndarray: Phase calibrated 校准后的相位

    ref:
        [Enabling Contactless Detection of Moving Humans with Dynamic Speeds Using CSI]
        (http://tns.thss.tsinghua.edu.cn/wifiradar/papers/QianKun-TECS2017.pdf)
    """
    p = np.asarray(phase)
    p = p[:, :30, :, :]
    k = np.asarray(k)


    slice1 = [slice(None, None)] * p.ndim
    slice1[axis] = slice(-1, None)
    slice1 = tuple(slice1)
    slice2 = [slice(None, None)] * p.ndim
    slice2[axis] = slice(None, 1)
    slice2 = tuple(slice2)

    shape1 = [1] * p.ndim
    shape1[axis] = k.shape[0]
    shape1 = tuple(shape1)

    k_n, k_1 = k[-1], k[0]

    a = (p[slice1] - p[slice2]) / (k_n - k_1)
    b = p.mean(axis=axis, keepdims=True)

    k = k.reshape(shape1)

    phase_calib = p - a * k - b
    return phase_calib


# -----------------------------------------------EMD分解，去除高频噪声
# 参考：https://blog.csdn.net/fengzhuqiaoqiu/article/details/127779846
# 参考：基于WiFi的人体行为感知技术研究（南京邮电大学的一篇硕士论文）
def emd_and_rebuild(s):
    '''对信号s进行emd分解，去除前2个高频分量后，其余分量相加重建新的低频信号'''
    emd = EMD()
    imf_a = emd.emd(s)

    new_s = np.zeros(s.shape[0])
    for n, imf in enumerate(imf_a):
        if n < 3:
            continue
        new_s = new_s + imf
    return new_s


# -----------------------------------------------FFT变换筛选子载波
# 参考：https://blog.csdn.net/zhengyuyin/article/details/127499584
# 参考：基于WiFi的人体行为感知技术研究（南京邮电大学的一篇硕士论文）
def dft_amp(signal):
    '''求离散傅里叶变换的幅值'''
    dft = fft(signal)
    dft = np.abs(dft)
    return dft


def respiration_freq_amp_ratio(dft_s, st_ix, ed_ix):
    '''计算呼吸频率范围内的频率幅值之和,与全部频率幅值之和的比值。函数计算出振幅在呼吸频率范围内的比例
    dft_s: 快速傅里叶变换后的序列幅值
    st_ix: 呼吸频率下限的序号
    ed_ix: 呼吸频率上限的序号
    '''

    if np.sum(dft_s) == 0:
        return np.sum(dft_s[st_ix:ed_ix]) / np.nan
    return np.sum(dft_s[st_ix:ed_ix]) / np.sum(dft_s)



# ----------------------------------------------------------------------------- 均值恒虚警（CA-CFAR）
# 参考：https://github.com/msvorcan/FMCW-automotive-radar/blob/master/cfar.py
# 参考：基于WiFi的人体行为感知技术研究（南京邮电大学的一篇硕士论文）
def detect_peaks(x, num_train, num_guard, rate_fa):
    """
    Parameters
    ----------
    x : signal，numpy类型
    num_train : broj trening celija, 训练单元数
    num_guard : broj zastitnih celija，保护单元数
    rate_fa : ucestanost laznih detekcija，误报率

    Returns
    -------
    peak_idx : niz detektovanih meta
    """
    num_cells = len(x)
    num_train_half = round(num_train / 2)
    num_guard_half = round(num_guard / 2)
    num_side = num_train_half + num_guard_half

    alpha = 0.09 * num_train * (rate_fa ** (-1 / num_train) - 1)

    peak_idx = []
    for i in range(num_side, num_cells - num_side):

        if i != i - num_side + np.argmax(x[i - num_side: i + num_side + 1]):
            continue

        sum1 = np.sum(x[i - num_side: i + num_side + 1])
        sum2 = np.sum(x[i - num_guard_half: i + num_guard_half + 1])
        p_noise = (sum1 - sum2) / num_train
        threshold = alpha * p_noise

        if x[i] > threshold and x[i] > -20:
            peak_idx.append(i)

    peak_idx = np.array(peak_idx, dtype=int)
    return peak_idx


if __name__ == '__main__':
    fs = 20
    tx_num = 3
    rx_num = 3
    bpm_count_num = rx_num * tx_num * 2 * 10

    is_sample = True
    sample_gap = 47

    csifile = './data/pc3.dat'

    while True:

        csidata = csiread.Intel(csifile, nrxnum=rx_num, ntxnum=tx_num, pl_size=10)
        csidata.read()
        csi = csidata.get_scaled_csi()
        print(csi.shape)

        """
        进行降采样
        """
        # 等间隔抽样，为了将数据采样成20Hz，比如本人设置的发包率为100，那么sample_gap=5就可以降采样成20Hz
        if is_sample:
            csi = csi.csi[0:-1:sample_gap, :, :, :]
            print(csi.shape)

        # 振幅和相位计算
        csi_amplitude = np.abs(csi)
        csi_phase = np.unwrap(np.angle(csi), axis=1)
        csi_phase = calib(csi_phase, scidx(20, 2))

        # 中值滤波，去除异常点
        """
        ref：https://blog.csdn.net/qq_38251616/article/details/115426742 
        
        np.apply_along_axis(func1d, axis, arr, *args, **kwargs)
        Input:
            - 需要用的函数
            - 沿哪个轴进行操作
            - 输入的N维数组（即要改变的）
            - 格外参数，可传递给func1d
            
        scipy.signal.medfilt(volume, kernel_size=None)
        Input:
            - 输入N维数组
            - 窗口大小，取多少个数的中值
        Output:
            - 中值滤波后的结果
        """
        csi_amplitude_filter = np.apply_along_axis(signal.medfilt, 0, csi_amplitude.copy(), 3)
        csi_phase_filter = np.apply_along_axis(signal.medfilt, 0, csi_phase.copy(), 3)

        # emd分解信号-重建信号
        """
        Input:
            - 过滤后的信号数据
        Output:
            - emd后的数据，以及去除前三个，剩下的相加重构呼吸信号
        """
        csi_amplitude_emd = np.apply_along_axis(emd_and_rebuild, 0, csi_amplitude_filter.copy())
        csi_phase_emd = np.apply_along_axis(emd_and_rebuild, 0, csi_phase_filter.copy())

        # 基于振幅的fft变换筛选子载波，并针对挑选出的子载波进行寻峰和呼吸速率计算
        csi_dft_amp = np.apply_along_axis(dft_amp, 0, csi_amplitude_emd.copy())

        n = csi_dft_amp.shape[0]
        l_ix = int(0.15 * n / fs)
        u_ix = int(0.5 * n / fs) + 1
        csi_respiration_freq_ratio = np.apply_along_axis(respiration_freq_amp_ratio, 0, csi_dft_amp.copy(), l_ix, u_ix)
        sum_bpm = 0
        bpm_count = 0
        all_respiration_freq_ratio = 0
        for i in range(csi_respiration_freq_ratio.shape[1]):
            for j in range(csi_respiration_freq_ratio.shape[2]):
                temp = np.sort(csi_respiration_freq_ratio[:, i, j])
                for k in range(30):
                    if csi_respiration_freq_ratio[k, i, j] < temp[20]:
                        continue

                    amplitude_peak_idx = detect_peaks(csi_amplitude_emd[:, k, i, j].copy(), num_train=20, num_guard=8,
                                                      rate_fa=1e-3)
                    phase_peak_idx = detect_peaks(csi_phase_emd[:, k, i, j].copy(), num_train=20, num_guard=8,
                                                  rate_fa=1e-3)
                    amplitude_bpm = 0
                    phase_bpm = 0
                    try:
                        # 基于振幅计算的每秒呼吸次数
                        amplitude_bpm = (len(amplitude_peak_idx) - 1) * fs / (
                                    amplitude_peak_idx[-1] - amplitude_peak_idx[0])
                        # 基于相位计算的每秒呼吸次数
                        if len(phase_peak_idx) < 2 or (phase_peak_idx[-1] - phase_peak_idx[0]) == 0:
                            phase_bpm = 0  # 或其他默认值
                        else:
                            phase_bpm = (len(phase_peak_idx) - 1) * fs / (phase_peak_idx[-1] - phase_peak_idx[0])

                        # 呼吸心率必须大于1分钟9次
                        if ~pd.isna(amplitude_bpm) and ~pd.isna(
                                phase_bpm) and amplitude_bpm > 0.15 and phase_bpm > 0.15:
                            sum_bpm = sum_bpm + amplitude_bpm + phase_bpm
                            bpm_count = bpm_count + 2
                            all_respiration_freq_ratio = all_respiration_freq_ratio + csi_respiration_freq_ratio[
                                k, i, j]
                    except:
                        pass

        mean_respiration_freq_ratio = all_respiration_freq_ratio / bpm_count
        print(bpm_count_num, bpm_count, round(mean_respiration_freq_ratio, 4))
        # 下面的两个阈值需针对不同设备自行调整，所参考代码的作者自行采集了几个站位和静坐的数据以及几个无人情况下的数据，进行分析得出
        # 区分有人和无人的阈值
        if bpm_count / bpm_count_num > 0.7 and mean_respiration_freq_ratio > 0.03:
            mean_bpm = sum_bpm / bpm_count
            print('rate ：', int(mean_bpm * 60), '次/分钟')
        else:
            print('无人！')
```


#### 修改版2
```python
# -*-coding:utf-8-*-
# -*-coding:utf-8-*-
import os
import time
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
# csi各种处理，参考宝藏工具：https://github.com/citysu/csiread
import csiread  # csiread/examples/csishow.py这里好多处理csi的基本操作，处理幅值和相位等等
import scipy.signal as signal
from PyEMD import EMD  # pip install EMD-signal
from scipy.fftpack import fft


# -----------------------------------------------求振幅和相位
# 参考：https://github.com/citysu/csiread 中utils.py和csishow.py
def scidx(bw, ng, standard='n'):
    """subcarriers index 子载波索引

    Args:
        bw: bandwitdh(20, 40, 80) 带宽，支持20，40，80和160Mhz
        ng: grouping(1, 2, 4)         组数：支持1，2，和4
        standard: 'n' - 802.11n， 'ac' - 802.11ac. 可以为 802.11n 或者 802.11ac
    Ref:
        1. 802.11n-2016: IEEE Standard for Information technology—Telecommunications
        and information exchange between systems Local and metropolitan area
        networks—Specific requirements - Part 11: Wireless LAN Medium Access
        Control (MAC) and Physical Layer (PHY) Specifications, in
        IEEE Std 802.11-2016 (Revision of IEEE Std 802.11-2012), vol., no.,
        pp.1-3534, 14 Dec. 2016, doi: 10.1109/IEEESTD.2016.7786995.
        2. 802.11ac-2013 Part 11: ["IEEE Standard for Information technology--
        Telecommunications and information exchange between systemsLocal and
        metropolitan area networks-- Specific requirements--Part 11: Wireless
        LAN Medium Access Control (MAC) and Physical Layer (PHY) Specifications
        --Amendment 4: Enhancements for Very High Throughput for Operation in
        Bands below 6 GHz.," in IEEE Std 802.11ac-2013 (Amendment to IEEE Std
        802.11-2012, as amended by IEEE Std 802.11ae-2012, IEEE Std 802.11aa-2012,
        and IEEE Std 802.11ad-2012) , vol., no., pp.1-425, 18 Dec. 2013,
        doi: 10.1109/IEEESTD.2013.6687187.](https://www.academia.edu/19690308/802_11ac_2013)
    """

    import numpy as np

    PILOT_AC = {
        20: [-21, -7, 7, 21],
        40: [-53, -25, -11, 11, 25, 53],
        80: [-103, -75, -39, -11, 11, 39, 75, 103],
        160: [-231, -203, -167, -139, -117, -89, -53, -25, 25, 53, 89, 117, 139, 167, 203, 231]
    }
    SKIP_AC_160 = {1: [-129, -128, -127, 127, 128, 129], 2: [-128, 128], 4: []}
    AB = {20: [28, 1], 40: [58, 2], 80: [122, 2], 160: [250, 6]}
    a, b = AB[bw]  # 根据带宽获取参数 a 和 b

    if standard == 'n':
        if bw not in [20, 40] or ng not in [1, 2, 4]:
            raise ValueError("带宽必须是 [20, 40] 且分组方式必须是 [1, 2, 4]")
        k = np.r_[-a:-b:ng, -b, b:a:ng, a]  # 生成子载波索引
    if standard == 'ac':
        if bw not in [20, 40, 80] or ng not in [1, 2, 4]:
            raise ValueError("带宽必须是 [20, 40, 80] 且分组方式必须是 [1, 2, 4]")

        g = np.r_[-a:-b:ng, -b]  # 生成中间索引 g
        k = np.r_[g, -g[::-1]]  # 生成完整的子载波索引 k

        if ng == 1:
            index = np.searchsorted(k, PILOT_AC[bw])  # 根据导频子载波位置删除相应索引
            k = np.delete(k, index)
        if bw == 160:
            index = np.searchsorted(k, SKIP_AC_160[ng])  # 删除需要跳过的子载波索引
            k = np.delete(k, index)
    return k  # 返回子载波索引


def calib(phase, k, axis=1):
    """Phase calibration 相位校准

    Args:
        phase (ndarray): Unwrapped phase of CSI. 已经展开的CSI相位
        k (ndarray): Subcarriers index 子载波索引
        axis (int): Axis along which is subcarrier. Default: 1 子载波所在的轴，默认值为1

    Returns:
        ndarray: Phase calibrated 校准后的相位

    ref:
        [Enabling Contactless Detection of Moving Humans with Dynamic Speeds Using CSI]
        (http://tns.thss.tsinghua.edu.cn/wifiradar/papers/QianKun-TECS2017.pdf)
    """
    p = np.asarray(phase)
    p = p[:, :30, :, :] #change
    k = np.asarray(k)

    # 定义切片，用于提取相位矩阵中最后一个和第一个子载波的相位值
    slice1 = [slice(None, None)] * p.ndim
    slice1[axis] = slice(-1, None)
    slice1 = tuple(slice1)
    slice2 = [slice(None, None)] * p.ndim
    slice2[axis] = slice(None, 1)
    slice2 = tuple(slice2)
    # 定义形状，用于重塑子载波索引数组 k
    shape1 = [1] * p.ndim
    shape1[axis] = k.shape[0]
    shape1 = tuple(shape1)

    # 计算第一个和最后一个子载波的索引值
    k_n, k_1 = k[-1], k[0]  # 这里本人做了修改，将k[1]改成k[0]了

    # 计算相位校准的斜率 a 和均值 b
    a = (p[slice1] - p[slice2]) / (k_n - k_1)
    b = p.mean(axis=axis, keepdims=True)

    # 重塑子载波索引数组 k
    k = k.reshape(shape1)

    # 计算校准后的相位
    phase_calib = p - a * k - b
    return phase_calib


# -----------------------------------------------EMD分解，去除高频噪声
# 参考：https://blog.csdn.net/fengzhuqiaoqiu/article/details/127779846
# 参考：基于WiFi的人体行为感知技术研究（南京邮电大学的一篇硕士论文）
def emd_and_rebuild(s):
    '''对信号s进行emd分解，去除前2个高频分量后，其余分量相加重建新的低频信号'''
    # 分解信号，生成固有模态函数（IMF），imf_a是信号分量，从高频到低频
    emd = EMD()
    imf_a = emd.emd(s)

    # 去掉前3个高频子信号，合成新低频信号
    new_s = np.zeros(s.shape[0])
    for n, imf in enumerate(imf_a):  # 返回索引和对应的imf
        # 注意论文中是去除前2个，本人这里调整为去除前3个高频分量
        if n < 3:
            continue
        new_s = new_s + imf
    return new_s


# -----------------------------------------------FFT变换筛选子载波
# 参考：https://blog.csdn.net/zhengyuyin/article/details/127499584
# 参考：基于WiFi的人体行为感知技术研究（南京邮电大学的一篇硕士论文）
def dft_amp(signal):
    '''求离散傅里叶变换的幅值'''
    # dft后，长度不变，是复数表示，想要频谱图需要取模
    dft = fft(signal)
    dft = np.abs(dft)
    return dft


def respiration_freq_amp_ratio(dft_s, st_ix, ed_ix):
    '''计算呼吸频率范围内的频率幅值之和,与全部频率幅值之和的比值。函数计算出振幅在呼吸频率范围内的比例
    dft_s: 快速傅里叶变换后的序列幅值
    st_ix: 呼吸频率下限的序号
    ed_ix: 呼吸频率上限的序号
    '''

    if np.sum(dft_s) == 0:
        return np.sum(dft_s[st_ix:ed_ix]) / np.nan  # 表示无法计算或结果无效
    return np.sum(dft_s[st_ix:ed_ix]) / np.sum(dft_s)



# ----------------------------------------------------------------------------- 均值恒虚警（CA-CFAR）
# 参考：https://github.com/msvorcan/FMCW-automotive-radar/blob/master/cfar.py
# 参考：基于WiFi的人体行为感知技术研究（南京邮电大学的一篇硕士论文）
def detect_peaks(x, num_train, num_guard, rate_fa):
    """
    Parameters
    ----------
    x : signal，numpy类型
    num_train : broj trening celija, 训练单元数
    num_guard : broj zastitnih celija，保护单元数
    rate_fa : ucestanost laznih detekcija，误报率

    Returns
    -------
    peak_idx : niz detektovanih meta
    """
    num_cells = len(x)
    num_train_half = round(num_train / 2)
    num_guard_half = round(num_guard / 2)
    num_side = num_train_half + num_guard_half

    alpha = 0.09 * num_train * (rate_fa ** (-1 / num_train) - 1)  # threshold factor

    peak_idx = []
    for i in range(num_side, num_cells - num_side):

        if i != i - num_side + np.argmax(x[i - num_side: i + num_side + 1]):
            continue

        sum1 = np.sum(x[i - num_side: i + num_side + 1])
        sum2 = np.sum(x[i - num_guard_half: i + num_guard_half + 1])
        p_noise = (sum1 - sum2) / num_train
        threshold = alpha * p_noise

        if x[i] > threshold and x[i] > -20:
            peak_idx.append(i)

    peak_idx = np.array(peak_idx, dtype=int)
    return peak_idx


if __name__ == '__main__':
    fs = 20  # 呼吸数据的采样率，设置为20Hz,数据包速率大于这个数的要进行下采样
    tx_num = 3
    rx_num = 3
    bpm_count_num = rx_num * tx_num * 2 * 10  # 理想情况下需要累加的呼吸速率个数

    is_sample = True  # 是否需要下采样
    sample_gap = 47  # 需要下采样则设置取数间隔

    # data_pt = 'E:/WiFi/test/data/csi_data/'
    csifile = './datasets/W1477-hhw.dat'
    # csifile = './data/pc3.dat'

    while True:
        # # 由于采数的shell脚本是不断产生30秒的数据文件的，为了不让数据文件撑爆硬盘，这里每次进入循环都要先删除多余的数据
        # # 文件，留下最新的两个数据文件，因数据文件名是按整数来命名且依次递增的，文件名最大的两个文件是最新的文件。
        # all_fl = sorted([int(item.split('.')[0]) for item in os.listdir(data_pt)])
        # if len(all_fl) < 2:
        #     time.sleep(2)
        #     continue
        # for i in range(len(all_fl) - 2):
        #     os.remove(data_pt + str(all_fl[i]) + '.dat')
        #
        # # 取倒数第2个文件而不是最新的文件，可以确保拿到的文件已经采满30秒，而最新的数据文件可能正在写入数据。
        # csifile = data_pt + str(all_fl[-2]) + '.dat'
        # print('\n', csifile)

        csi = csiread.Atheros(csifile, nrxnum=rx_num, ntxnum=tx_num, pl_size=10)
        csi.read(endian='little')
        print(csi.csi.shape)

        # csidata = csiread.Intel(csifile, nrxnum=rx_num, ntxnum=tx_num, pl_size=10)
        # csidata.read()
        # csi = csidata.get_scaled_csi()
        # print(csi.shape)

        """
        进行降采样
        """
        # 等间隔抽样，为了将数据采样成20Hz，比如本人设置的发包率为100，那么sample_gap=5就可以降采样成20Hz
        if is_sample:
            csi = csi.csi[0:-1:sample_gap, :, :, :]
            print(csi.shape)

        # 振幅和相位计算
        csi_amplitude = np.abs(csi)  # 求csi值的振幅（复数绝对值）
        csi_phase = np.unwrap(np.angle(csi), axis=1)  # 求csi值的相位（复数相位-消除相位跳变）
        # print(scidx(20,2))
        csi_phase = calib(csi_phase, scidx(20, 2))  # 校准相位的值
        # print('csi_phase: ', csi_phase[:2, 1, 2, 1])

        # 中值滤波，去除异常点
        """
        ref：https://blog.csdn.net/qq_38251616/article/details/115426742 
        
        np.apply_along_axis(func1d, axis, arr, *args, **kwargs)
        Input:
            - 需要用的函数
            - 沿哪个轴进行操作
            - 输入的N维数组（即要改变的）
            - 格外参数，可传递给func1d
            
        scipy.signal.medfilt(volume, kernel_size=None)
        Input:
            - 输入N维数组
            - 窗口大小，取多少个数的中值
        Output:
            - 中值滤波后的结果
        """
        # 沿着第一维度，对幅值和相位应用 中值滤波 [振幅和相位]
        csi_amplitude_filter = np.apply_along_axis(signal.medfilt, 0, csi_amplitude.copy(), 3)  # 中值滤波,窗口必须为奇数，此处窗口为3
        csi_phase_filter = np.apply_along_axis(signal.medfilt, 0, csi_phase.copy(), 3)  # 中值滤波,窗口必须为奇数，此处窗口为3
        # print('csi_phase_filter: ', csi_phase_filter[:2, 1, 2, 1])

        # csi_amplitude_filter = csi_amplitude_filter[0:-1:5, :, :, :]
        # csi_phase_filter = csi_phase_filter[0:-1:5, :, :, :]
        # print(csi_phase_filter.shape)

        # emd分解信号-重建信号
        """
        Input:
            - 过滤后的信号数据
        Output:
            - emd后的数据，以及去除前三个，剩下的相加重构呼吸信号
        """
        csi_amplitude_emd = np.apply_along_axis(emd_and_rebuild, 0, csi_amplitude_filter.copy())
        csi_phase_emd = np.apply_along_axis(emd_and_rebuild, 0, csi_phase_filter.copy())
        # print('csi_phase_emd: ', csi_phase_emd[:2, 1, 2, 1])

        # 基于振幅的fft变换筛选子载波，并针对挑选出的子载波进行寻峰和呼吸速率计算
        csi_dft_amp = np.apply_along_axis(dft_amp, 0, csi_amplitude_emd.copy())

        n = csi_dft_amp.shape[0]  # 采样点数
        # 0.15Hz对应dft中值的序号,呼吸频率下限
        l_ix = int(0.15 * n / fs)
        # 0.5Hz对应dft中值的序号,呼吸频率上限
        u_ix = int(0.5 * n / fs) + 1
        # 计算呼吸频率值的占比，每个子载波在该范围内呼吸频率的强度
        csi_respiration_freq_ratio = np.apply_along_axis(respiration_freq_amp_ratio, 0, csi_dft_amp.copy(), l_ix, u_ix)
        # 针对1发1收对应的30个载波筛选出10个载波，进行呼吸频率计算
        sum_bpm = 0
        bpm_count = 0
        all_respiration_freq_ratio = 0
        for i in range(csi_respiration_freq_ratio.shape[1]):
            for j in range(csi_respiration_freq_ratio.shape[2]):
                temp = np.sort(csi_respiration_freq_ratio[:, i, j])  # 进行排序
                for k in range(30):
                    if csi_respiration_freq_ratio[k, i, j] < temp[20]:  # 排名前10的才会进入下面的计算,如果temp[19]==temp[20]就会多出来一个
                        continue

                    amplitude_peak_idx = detect_peaks(csi_amplitude_emd[:, k, i, j].copy(), num_train=20, num_guard=8,
                                                      rate_fa=1e-3)
                    phase_peak_idx = detect_peaks(csi_phase_emd[:, k, i, j].copy(), num_train=20, num_guard=8,
                                                  rate_fa=1e-3)
                    amplitude_bpm = 0
                    phase_bpm = 0
                    try:
                        # 基于振幅计算的每秒呼吸次数
                        amplitude_bpm = (len(amplitude_peak_idx) - 1) * fs / (
                                    amplitude_peak_idx[-1] - amplitude_peak_idx[0])
                        # 基于相位计算的每秒呼吸次数
                        if len(phase_peak_idx) < 2 or (phase_peak_idx[-1] - phase_peak_idx[0]) == 0:
                            phase_bpm = 0  # 或其他默认值
                        else:
                            phase_bpm = (len(phase_peak_idx) - 1) * fs / (phase_peak_idx[-1] - phase_peak_idx[0])

                        # 呼吸心率必须大于1分钟9次
                        if ~pd.isna(amplitude_bpm) and ~pd.isna(
                                phase_bpm) and amplitude_bpm > 0.15 and phase_bpm > 0.15:
                            sum_bpm = sum_bpm + amplitude_bpm + phase_bpm
                            bpm_count = bpm_count + 2
                            all_respiration_freq_ratio = all_respiration_freq_ratio + csi_respiration_freq_ratio[
                                k, i, j]
                            # print(i, j, k, bpm_count)
                    except:
                        pass
                    # print(i, j, k, amplitude_bpm, phase_bpm)

        mean_respiration_freq_ratio = all_respiration_freq_ratio / bpm_count  # 呼吸频率范围的平均频率值
        print(bpm_count_num, bpm_count, round(mean_respiration_freq_ratio, 4))
        # 下面的两个阈值需针对不同设备自行调整，本人自行采集了几个站位和静坐的数据以及几个无人情况下的数据，进行分析得出
        # 区分有人和无人的阈值
        if bpm_count / bpm_count_num > 0.7 and mean_respiration_freq_ratio > 0.03:
            mean_bpm = sum_bpm / bpm_count
            print('rate ：', int(mean_bpm * 60), '次/分钟')
        else:
            print('无人！')
```