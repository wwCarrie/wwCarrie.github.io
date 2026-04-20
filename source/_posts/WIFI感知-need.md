---
title: Some need
date: 2024-08-05 14:14:22
categories: [科研笔记]
tags: WIFI感知
---

这篇主要是WIFI感知（包括CSI）相关知识的一个梳理

##### 入门
- 软硬件平台：基础至少需要一个发送设备+一个接收设备，各设备2-3个外接天线。
- CSI测量工具：Linux Ubuntu系统安装，Atheros CSI tool、Intel 5300 NIC CSI tool，Nexus 5（不同测量工具对网卡版本均有要求）
- CSI处理
##### 进阶
- 感知算法设计
- 感知系统可视化
##### 案例实践
- Widar 3.0 http://tns.thss.tsinghua.edu.cn/widar3.0/

**Wi-Fi**感知，顾名思义，就是利用Wi-Fi信号实现对周围环境以及环境中的人体、物体状态的感知。现有Wi-Fi感知方法主要通过分析从Wi-Fi信号采集到信道状态信息（Channel State Information，CSI）实现

##### Atheros CSI Tool

[官方网站](https://wands.sg/research/wifi/AtherosCSI/#Overview)

[指引文件](https://wands.sg/research/wifi/AtherosCSI/document/Atheros-CSI-Tool-User-Guide.pdf)

[开源地址](https://github.com/xieyaxiongfly/Atheros-CSI-Tool)

##### Intel 5300 

[官方网站](https://dhalperi.github.io/linux-80211n-csitool/index.html)

##### Nexus 5 

[官方网站](https://link.zhihu.com/?target=https%3A//github.com/seemoo-lab/nexmon_csi)

##### CSI基础处理

CSI测量值解析出来为a+bj的复数形式

[相关工作及代码](https//github.com/xyanchen/WiFi-CSI-Sensing-Benchmark)

##### 自我翻阅的help

[one road](http://tns.thss.tsinghua.edu.cn/wst/)

[two Wifi Sensing CSDN](https://blog.csdn.net/qq_42980908/category_10655638.html)

[three data_and_code github](https://github.com/xyanchen/WiFi-CSI-Sensing-Benchmark)

[four Wifi Sensing Github](https://github.com/Marsrocky/Awesome-WiFi-CSI-Sensing?tab=readme-ov-file#benchmark)

##### CSI Tool

[csikit](https://github.com/gi-z/csikit)

[csiread](https://github.com/citysu/csiread)

[matlab online](https://matlab.mathworks.com/)

[matlab Drive](https://www.mathworks.com/products/matlab-drive.html)