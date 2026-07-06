---
title: 优惠券秒杀
tags: 黑马点评
categories:
  - 学习笔记
  - 后端
date: 2026-07-03 23:34:25
---

# 优惠券秒杀

![秒杀框架](./heima-dp-3/image-3.png)

自增id存在问题：

- id规律性明显
- 受单表数据量限制，违背唯一性

使用分布式ID（全局唯一ID）：

- 全局唯一性
- 高可用性
- 高性能
- 安全性
- 递增性

## 分布式ID实现

<img src="./heima-dp-3/image-1.png" style="max-width:100%;">

符号位、时间戳、序列号

**分布式ID生成器**

```java
@Component
public class RedisIdWorker {

    @Resource
    private StringRedisTemplate stringRedisTemplate;
    /**
     * 开始时间戳
     */
    private static final long BEGIN_TIMESTAMP = 1640995200;
    /**
     * 序列化位数
     */
    private static final int COUNT_BITS = 32;

    /**
     * 生成分布式ID
     * @param keyPrefix 业务前缀，不同的业务使用不同的key
     * @return
     */
    public long nextId(String keyPrefix){
        // 1、生成时间戳
        LocalDateTime now = LocalDateTime.now();
        long nowSecond = now.toEpochSecond(ZoneOffset.UTC);
        long timestamp = nowSecond - BEGIN_TIMESTAMP;
        // 2、生成序列号
        // 以当天的时间戳为key，防止一直自增下去导致超时，这样每天的极限都是 2^{31}
        String date = now.format(DateTimeFormatter.ofPattern("yyyy:MM:dd"));
        Long count = stringRedisTemplate.opsForValue().increment("icr:" + keyPrefix + ":" + date);
        // 3、拼接并返回
        return timestamp << COUNT_BITS | count;
    }

    public static void main(String[] args) {
        LocalDateTime time = LocalDateTime.of(2022, 1, 1, 0, 0, 0);
        long second = time.toEpochSecond(ZoneOffset.UTC);
        System.out.println("second = " + second);
    }
}
```

**测试类**

```java
@SpringBootTest
public class RedisIdWorkerTest {

    @Resource
    private RedisIdWorker redisIdWorker;

    private ExecutorService es = Executors.newFixedThreadPool(500);

    /**
     * 测试分布式ID生成器的性能，以及可用性
     */
    @Test
    public void testNextId() throws InterruptedException {
        // 使用CountDownLatch让线程同步等待
        CountDownLatch latch = new CountDownLatch(300);
        // 创建线程任务
        Runnable task = () -> {
            for (int i = 0; i < 100; i++) {
                long id = redisIdWorker.nextId("order");
                System.out.println("id = " + id);
            }
            // 等待次数-1
            latch.countDown();
        };
        long begin = System.currentTimeMillis();
        // 创建300个线程，每个线程创建100个id，总计生成3w个id
        for (int i = 0; i < 300; i++) {
            es.submit(task);
        }
        // 线程阻塞，直到计数器归0时才全部唤醒所有线程
        latch.await();
        long end = System.currentTimeMillis();
        System.out.println("生成3w个id共耗时" + (end - begin) + "ms");
    }
}
```

**业务流程**

1. 库存是否充足
2. 秒杀时间是否到

扣减库存、创建订单 是两次MySQL操作，所以使用**@Transactional**保证事务同成功同失败

```java
@Service
public class VoucherOrderServiceImpl extends ServiceImpl<VoucherOrderMapper, VoucherOrder> implements IVoucherOrderService {

    @Resource
    private ISeckillVoucherService seckillVoucherService;

    @Resource
    private RedisIdWorker redisIdWorker;

    /**
     * 抢购秒杀券
     */
    @Transactional
    @Override
    public Result seckillVoucher(Long voucherId) {
        // 1、查询秒杀券
        SeckillVoucher voucher = seckillVoucherService.getById(voucherId);
        // 2、判断秒杀券是否合法
        if (voucher.getBeginTime().isAfter(LocalDateTime.now())) {
            // 秒杀券的开始时间在当前时间之后
            return Result.fail("秒杀尚未开始");
        }
        if (voucher.getEndTime().isBefore(LocalDateTime.now())) {
            // 秒杀券的结束时间在当前时间之前
            return Result.fail("秒杀已结束");
        }
        // 3、判断库存是否充足
        if (voucher.getStock() < 1) {
            return Result.fail("秒杀券已抢空");
        }
        // 4、扣减库存
        boolean success = seckillVoucherService.update()
                .setSql("stock = stock -1")
                .eq("voucher_id", voucherId).update();
        if (!success) {
            throw new RuntimeException("秒杀券扣减库存失败");
        }
        // 5、创建订单
        VoucherOrder voucherOrder = new VoucherOrder();
        // 分布式ID作为订单主键ID
        long orderId = redisIdWorker.nextId("order");
        voucherOrder.setId(orderId);
        voucherOrder.setUserId(UserHolder.getUser().getId());
        voucherOrder.setVoucherId(voucherId);
        save(voucherOrder);
        // 6、返回订单id
        return Result.ok(orderId);
    }
}
```

## 库存超卖（客观锁+悲观锁）

 Jmeter 进行压力测试，并发出现安全问题

解决方法：

- **悲观锁**：先获取锁，方法：`synchronized`、`lock`

- **乐观锁**：不加锁，只会在更新数据库的时候去判断有没有其它线程对数据进行修改。方法：版本号法、CAS操作、乐观锁算法

  - 方法1：版本号法

    - 为 tb_seckill_voucher 表新增一个版本号字段 version 。
    - 查询时不仅查库存，还要查版本号
    - 更新时检查版本号是否未变化(通过where条件实现)，若未变化则更新库存并递增版本号。

  - 方法2：CAS法

    - 直接使用库存替代版本号

      ```java
      // 4、扣减库存
      boolean success = seckillVoucherService.update()
              .setSql("stock = stock -1")
              .eq("voucher_id", voucherId)
              .eq("stock", voucher.getStock())
              .update();
      ```

乐观锁的**弊端**：只要发现数据有修改，就直接终止操作了，导致成功率低。
更改为：只要库存大于0就可以进行修改。

```java
// 4、扣减库存
boolean success = seckillVoucherService.update()
        .setSql("stock = stock -1")
        .eq("voucher_id", voucherId)
        .gt("stock", 0)
        .update();
```

## 一人一单

### 单机一人一单

同一个优惠券，一个用户只能下一单

方法：增加 根据优惠券id和用户id查询订单

```java
@Service
public class VoucherOrderServiceImpl extends ServiceImpl<VoucherOrderMapper, VoucherOrder> implements IVoucherOrderService {

    @Resource
    private ISeckillVoucherService seckillVoucherService;

    @Resource
    private RedisIdWorker redisIdWorker;

    /**
     * 抢购秒杀券
     */
    @Transactional
    @Override
    public Result seckillVoucher(Long voucherId) {
        // 1、查询秒杀券
        SeckillVoucher voucher = seckillVoucherService.getById(voucherId);
        // 2、判断秒杀券是否合法
        if (voucher.getBeginTime().isAfter(LocalDateTime.now())) {
            // 秒杀券的开始时间在当前时间之后
            return Result.fail("秒杀尚未开始");
        }
        if (voucher.getEndTime().isBefore(LocalDateTime.now())) {
            // 秒杀券的结束时间在当前时间之前
            return Result.fail("秒杀已结束");
        }
        // 3、判断库存是否充足
        if (voucher.getStock() < 1) {
            return Result.fail("秒杀券已抢空");
        }
        // 4、一人一单校验
        Long userId = UserHolder.getUser().getId();
        int count = query().eq("user_id", userId).eq("voucher_id", voucherId).count();
        if(count > 0){
            // 用户已购买过该优惠券
            return Result.fail("用户已购买过该优惠券");
        }
        // 5、扣减库存
        boolean success = seckillVoucherService.update()
                .setSql("stock = stock -1")
                .eq("voucher_id", voucherId)
                .gt("stock", 0)
                .update();
        if (!success) {
            throw new RuntimeException("秒杀券扣减库存失败");
        }
        // 6、创建订单
        VoucherOrder voucherOrder = new VoucherOrder();
        long orderId = redisIdWorker.nextId("order");
        voucherOrder.setId(orderId);
        voucherOrder.setUserId(userId);
        voucherOrder.setVoucherId(voucherId);
        save(voucherOrder);
        // 7、返回订单id
        return Result.ok(orderId);
    }
}
```

但同时存在并发安全问题，这个业务中是判断用户是否购买过，即判断是否存在数据库记录，而不是判断是否修改过，所以无法使用乐观锁方案，而是使用悲观锁方案

即：

- 乐观锁：判断修改过
- 悲观锁：判断是否存在数据库记录（只能）

最终使用悲观锁

```java
@Service
public class VoucherOrderServiceImpl extends ServiceImpl<VoucherOrderMapper, VoucherOrder> implements IVoucherOrderService {

    @Resource
    private ISeckillVoucherService seckillVoucherService;

    @Resource
    private RedisIdWorker redisIdWorker;

    /**
     * 抢购秒杀券
     */
    @Override
    public Result seckillVoucher(Long voucherId) {
        // 1、查询秒杀券
        SeckillVoucher voucher = seckillVoucherService.getById(voucherId);
        // 2、判断秒杀券是否合法
        if (voucher.getBeginTime().isAfter(LocalDateTime.now())) {
            // 秒杀券的开始时间在当前时间之后
            return Result.fail("秒杀尚未开始");
        }
        if (voucher.getEndTime().isBefore(LocalDateTime.now())) {
            // 秒杀券的结束时间在当前时间之前
            return Result.fail("秒杀已结束");
        }
        // 3、判断库存是否充足
        if (voucher.getStock() < 1) {
            return Result.fail("秒杀券已抢空");
        }
        Long userId = UserHolder.getUser().getId();
        // 去字符串常量池找字符串对象,使得加锁同一个对象
        // 先获取锁，再开启事务，事务结束后，才会释放锁
        synchronized (userId.toString().intern()) {
            // spring的事务是基于代理对象的,这里直接调用相当于this.xxx,并非代理对象,因此事务不会生效,所以要拿到代理对象
            IVoucherOrderService proxy = (IVoucherOrderService) AopContext.currentProxy();
            return proxy.createVoucherOrder(voucherId);
        }
    }

    @Transactional
    public Result createVoucherOrder(Long voucherId) {
        Long userId = UserHolder.getUser().getId();
        // 4、一人一单校验
        int count = query().eq("user_id", userId).eq("voucher_id", voucherId).count();
        if (count > 0) {
            // 用户已购买过该优惠券
            return Result.fail("用户已购买过该优惠券");
        }
        // 5、扣减库存
        boolean success = seckillVoucherService.update()
                .setSql("stock = stock -1")
                .eq("voucher_id", voucherId)
                .gt("stock", 0)
                .update();
        if (!success) {
            throw new RuntimeException("秒杀券扣减库存失败");
        }
        // 6、创建订单
        VoucherOrder voucherOrder = new VoucherOrder();
        long orderId = redisIdWorker.nextId("order");
        voucherOrder.setId(orderId);
        voucherOrder.setUserId(userId);
        voucherOrder.setVoucherId(voucherId);
        save(voucherOrder);
        // 7、返回订单id
        return Result.ok(orderId);
    }
}
```

**细节**

1. 锁的**范围尽量小**。`synchronized`尽量锁代码块，而不是方法，锁的范围越大性能越低
2. 锁的对象一定要是一个不变的值。我们不能直接锁 `Long` 类型的 userId，每请求一次都会创建一个新的 userId 对象，synchronized 要锁不变的值，所以我们要将 **Long 类型的 userId** 通过 **toString()方法** 转成 `String` 类型的 userId，`toString()`方法底层（可以点击去看源码）是直接 new 一个新的String对象，显然还是在变，所以我们要使用 **`intern()` 方法**从**常量池中寻找与当前字符串值一致的字符串对象**，这就能够保障一个用户 发送多次请求，每次请求的 userId 都是不变的，从而能够完成锁的效果（并行变串行）
3. 我们要**锁住整个事务**，而不是锁住事务内部的代码。 先获取锁，再开启事务，事务结束后，才会释放锁。如果我们锁住事务内部的代码会导致锁释放时，事务未提交，其它线程能够获取锁，仍然会存在超卖问题
4. Spring 的 @Transactional 事务是基于代理对象的，这里直接调用相当于 this.xxx， 并非代理对象，因此事务不会生效，所以**要拿到代理对象**

*（补）*

**生成代理对象生效步骤：**

1. 引入AOP依赖，动态代理

   ```java
   <dependency>
     <groupId>org.aspectj</groupId>
     <artifactId>aspectjweaver</artifactId>
   </dependency>
   ```

2. 暴露动态代理对象，启动类上加入（默认关闭）

​	`@EnableAspectJAutoProxy(exposeProxy = true)`

### 集群一人一单

高并发，部署到多个不同机器

**步骤：**

- `Ctrl+D`：IDEA中启动两个SpringBoot程序，一个端口号是8081，另一个端口是8082

- 在Nginx中配置负载均衡

  <img src="./heima-dp-3/image-2.png" style="max-width:80%;">

- 准备两个接口，打断点

**存在问题**：存在两个JVM，synchronized不能跨 JVM 进行上锁

因此，使用分布锁。

## 分布式锁

解决集群下一人一单问题，在整个系统的全局中设置一个锁监视器。





## 总结

<img src="./heima-dp-3/image-4.png" style="max-width:80%;">
