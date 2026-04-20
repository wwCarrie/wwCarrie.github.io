---
title: Tableau
tags: 数据分析
date: 2024-07-25 18:39:05
---


[Tableau下载地址](https://www.tableau.com/zh-cn/support/releases)

[学生版认证--获取密钥](https://www.tableau.com/zh-cn/academic/students#form)

![alt text](./数分-Tableau/image.png)

完成了，好激动！准备开始学习（Fighting）

## 数据库连接

### 连接

有多种连接的来源，可以供选择

![alt text](./数分-Tableau/image-1.png)

当选择两个数据进行连接后，需要选择字段

![alt text](./数分-Tableau/image-2.png)

### 提取方式

![alt text](./数分-Tableau/image-3.png)

- 实时：每一次更新都需要导入数据
- 数据提取：存储到Tableau的数据库里面
- 筛选器：当数据较多，且已经明确了所要的数据时，可以提前在这筛选掉

### 保存方式

- twb：不带数据，需要连接
- twbx：内置数据

### 数据查看

![alt text](./数分-Tableau/image-4.png)

性能和数据响应程度做取舍，都是需要成本的。

## 数据可视化

数据变成图表的过程，就是数据映射到视觉图形的过程

![alt text](./数分-Tableau/image-5.png)

#### 数据：维度和度量

- 数值型【度量】：一般由数字组成，表示为图表的面积大小、条形长短、颜色深浅等可以量化的视觉元素
- 类别型【维度】：有限的类别数或可区分组数，表示为图表的颜色种类、图形位置、分类方式等视觉元素

【度量】映射图形，【维度】负责区分

数据可映射的数据类型：
- 位置

散点图主要有四种数据规律

![alt text](./数分-Tableau/image-6.png)

- 长度
- 角度，例如饼状图
- 方向，例如折线图
- 形状
- 面积和体积
- 颜色和深浅

可视化字典

![alt text](./数分-Tableau/image-7.png)

视觉图形的暗示排序清单

![alt text](./数分-Tableau/image-8.png)

数据可视化领域的四大金刚：散点图、柱状图/条形图、饼图、折线图

图形分为：有轴和无轴

1. 气泡图

- GMV：大小，选择圆
- 日期：标签

![alt text](./数分-Tableau/image-9.png)

2. 折线图

- 日期：列，文本格式
- GMV：行

![alt text](./数分-Tableau/image-10.png)

- 平台：列第一个

![alt text](./数分-Tableau/image-11.png)

- 平台：颜色

![alt text](./数分-Tableau/image-12.png)

3. 词云图

- GMV：大小，文本
- 日期：文本

![alt text](./数分-Tableau/image-13.png)

4. 饼图

- GMV：大小，饼图
- 门店名称：颜色

![alt text](./数分-Tableau/image-14.png)

5. 制作表

- 另一种方式是直接拖拽到abc，文本那里

![alt text](./数分-Tableau/image-15.png)

- GMV改成离散，就会变成数值，写入表格

![alt text](./数分-Tableau/image-16.png)

## 基础图表制作

### 对比分析：比大小

#### 条形图或柱状图

- 柱状图：

应用场景：
- 较少变量之间的对比分析
- 各大区之间的业绩对比
- 各大类商品之间的销售额对比

![alt text](./数分-Tableau/image-17.png)

- 转置为条形图：

应用场景：
- 较多变量之间的对比分析
- 各人之间的业绩对比
- 个商品之间的销售额对比

![alt text](./数分-Tableau/image-18.png)

- 创建分级结构，实现数据钻取

右键-品牌名称-创建分层结构：

![alt text](./数分-Tableau/image-19.png)

![alt text](./数分-Tableau/image-20.png)

![alt text](./数分-Tableau/image-21.png)

- 筛选器

![alt text](./数分-Tableau/image-22.png)

#### 热力图

应用场景：
- 多【维度】下多变量的同时对比，并且需要同时查看对比效果和数值
- 各组/商品类别之间的销售额、利润同时对比

又称为"突出显示表"，度量值和度量名称放上去，修改为"方形"

![alt text](./数分-Tableau/image-23.png)

#### 气泡图和词云图

应用场景1：
- 极多变量下在同一度量上的对比分析
- 一个班或者全公司所有个人的某一度量分析

应用场景2：
- 多变量下在同一度量上的对比分析，同时需要突出变量名称

![alt text](./数分-Tableau/image-24.png)

![alt text](./数分-Tableau/image-25.png)

## 构成分析：看占比

#### 饼图

应用场景：
- 一个【维度】下各个变量在某一【度量】下所占比例
- 性别维度下，男女顾客各占成交金额的百分比

![alt text](./数分-Tableau/image-26.png)

百分比：快速表计算，合计百分比

![alt text](./数分-Tableau/image-27.png)

#### 树地图

应用场景：
- 一个度量在多个维度下的占比展现和分析
- 各组销售贡献度
- 各用户用户贡献度

占比最大的在左上方

![alt text](./数分-Tableau/image-28.png)

#### 堆积图

应用场景：
- 相同【度量】下，比较一个【维度】下另一个【维度】的占比
- 各地区各品类产品对销售额的贡献

![alt text](./数分-Tableau/image-43.png)

如果要同一条百分比计算的话，需要修改合计百分比，改为向下

![alt text](./数分-Tableau/image-29.png)

列里计算【相对百分比】

![alt text](./数分-Tableau/image-30.png)

- 相对百分比：都是百分百，看占比的变化

- 绝对百分比：绝对值有区别，内部进行百分比展示

![alt text](./数分-Tableau/image-31.png)

## 变化分析：看趋势

#### 折线图

应用场景：
- 基于时间【维度】分析【度量】的数据变化及去世
- 过去三年的成交额变化

上面的年月日，是同一个

下面的年月日，不是同一个，都是切分开来展示的

![alt text](./数分-Tableau/image-32.png)

- 可以添加预测（但仅限于连续日期）

![alt text](./数分-Tableau/image-33.png)

- 趋势线

![alt text](./数分-Tableau/image-34.png)

不要用折线图来呈现维度的变化

![alt text](./数分-Tableau/image-44.png)

#### 面积图

应用场景：
- 有内部累计关系的数值随时间变化
- 不强调去世，强调绝对值

![alt text](./数分-Tableau/image-35.png)

## 关系分布：看位置

#### 散点图

应用场景：
- 分析某一【维度】变量在两个【度量】下的分布和变量之间的相关性
- 产品的销售额和所得利润之间的关系（正、弱、不相关）

![alt text](./数分-Tableau/image-36.png)

将门店设为颜色，并且添加趋势

![alt text](./数分-Tableau/image-37.png)

- 聚类（群集区分）

![alt text](./数分-Tableau/image-38.png)

#### 直方图

应用场景：
- 查看单一度量下的数据分布
常见分布：
- 2/8法则
- 马太效应
- 40-20-10

![alt text](./数分-Tableau/image-45.png)

数据桶：对数据进行分类，分类后进行计数

![alt text](./数分-Tableau/image-39.png)

#### 地图

应用场景：
- 基于地理位置的数据分析

改为城市或者自治区/省/市，然后双击，就会出现地图

- 点地图：变成点

- 行政边界地图：被颜色涂满

![alt text](./数分-Tableau/image-40.png)

具体：

1. 地理坐标改为经纬度

地理角色-经纬度

2. 添加区分的字段

创建唯一区分：创建主键，要素相加，要转换为字符串

![alt text](./数分-Tableau/image-41.png)

3. 距离，深浅

![alt text](./数分-Tableau/image-42.png)

## BI仪表盘搭建

一些注意事项：
- 区分用户：给谁看
- 主次分明，详略得当
- 真实准确：坐标轴从0开始
- 符合大众的认知审美
- 适度原则：原色不要太多，尽量不要3D效果
- 五秒原则
- 恰到好处的说明：注释，右键-添加注释
- 少即是多

### 搭建前

- 明确仪表盘主题
![alt text](./数分-Tableau/image-46.png)
![alt text](./数分-Tableau/image-47.png)
![alt text](./数分-Tableau/image-48.png)

- 搭建主题拆解

1. 需要哪些数据
2. 重要性
3. 适合什么图表
![alt text](./数分-Tableau/image-49.png)

### 搭建图表

- 经营情况总览

先把第一个拖过去，然后其他的拖到上面，出现【智能..】

![alt text](./数分-Tableau/image-51.png)

筛选器，应用于所有工作表

![alt text](./数分-Tableau/image-52.png)

- 每日流量数据

当出现，度量值不一样时候，一个几乎是直线时候

![alt text](./数分-Tableau/image-53.png)

分开来度量，百分比和百分比放一起

然后，选择双轴

![alt text](./数分-Tableau/image-54.png)

- 占比

如何制作环形图？中间空一格

1. 在饼状图的基础上，行输入创建两个0
2. 选择双轴
3. 其中一个总和设置为空白的

![alt text](./数分-Tableau/image-55.png)

4. 调整两个之间的大小

![alt text](./数分-Tableau/image-56.png)

5. 删去两边的和中轴线

- 地图

设置不同区间，不同颜色

1. 距离-创建-组
2. 选择区间内的数值（shift）

### 搭建表盘

![alt text](./数分-Tableau/image-57.png)

1. 增加工作表
2. 增加仪表盘
3. 增加故事（相当于PPT）

进行布局

#### 筛选器

可以让每个图表点击后，就进行筛选。

![alt text](./数分-Tableau/image-58.png)

剩下的进行一些细微的调整即可。

### 成果
![alt text](./数分-Tableau/仪表板%201.png)

## 后记

一些仪表盘颜色搭配方案（海报学习）：

- [配色方案](https://mp.weixin.qq.com/s?__biz=MzA5NjU0NzIwNg==&mid=2650036415&idx=1&sn=3b5e72771bfec0d960d0e01710493053&chksm=88ae8056bfd90940d20db9f21e4d7fc9c17f21db8a0927141ad460d07e5163e92280be065e0d&mpshare=1&scene=24&srcid=0426d8DyZclI6CJVxZDf02WZ&key=f4f55a58660f93ccce2c1deaa55ffabaf90aecf722a158bd56bc701eb12fd0885caeff730049d94374d5e5ea4e4e202bba884f47bf6e79d8fd995aabd0fe0ae767b1953e1de9ebe71c1180d2bac34cbc&ascene=1&uin=NjUxNTQzMDA1&devicetype=Windows+10+x64&version=62090070&lang=zh_CN&exportkey=A%2BuM0BhkPclQXhoZDf6l7Mo%3D&pass_ticket=5H0yKOohxiKsClwYcnWMWFj%2FgWFhPGGnKVKKH8udgafp%2FaOmL7VZ8Xr6Bnpg8ue2)
- [Pinterest](https://www.pinterest.com/)
- [dribbble](http://bddz.jiulannet.com/bh.html?t=p&siteId=174&utm_source=baidu05&utm_medium=sem&utm_campaign=dribbble%E8%AE%A1%E5%88%92&utm_content=dribbble%E6%90%9C%E7%B4%A2%E8%AF%8D&utm_term=dribbble&bd_vid=5573805748369161317)
- [站酷](https://www.zcool.com.cn/)

---

- [Tableau社区](https://public.tableau.com/app/discover)
- [简书Tableau 每日学一点](https://www.jianshu.com/u/4da146d6af37)
- [B站教学 查缺补漏](https://www.bilibili.com/video/BV1E4411B7ef/?t=10.649503&spm_id_from=333.1350.jump_directly)