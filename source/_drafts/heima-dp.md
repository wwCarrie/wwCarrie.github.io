---
title: heima_dp
tags: 黑马点评
categories:
  - 学习笔记
  - 后端
---

# Redis基础概念

## 认识

属于NoSQL

​    <img src="./heima-dp/image-1.png" style="max-width:60%;">

命令：https://redis.io/commands 

数据结构类型：

- String
- Hash
- List
- Set
- SortedSet

## 客户端

网址：https://redis.io/clients

### Jedis

 https://github.com/redis/jedis

- 引入依赖
- 创建对象，建立连接
- Jedis使用
- 释放资源

连接池

### SpringDataRedis

https://spring.io/projects/spring-data-redis

- 引入spring-boot-starter-data-redis依赖
- yml配置redis
- 注入RedisTemplate

#### 序列化方式

- 自动化
  - 自定义RedisTemplate
  - 修改RedisTemplate的序列化器为GenericJackson2JsonRedisSerializer
- 省内存
  - 使用StringRedisTemplate
  - 写入Redis时，手动把对象序列化为JSON
  - 读取Redis时，手动把读取到的JSON反序列化为对象
