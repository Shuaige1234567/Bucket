* Container 

  ### 性能优化

  * 自动扩容
    * 现阶段自动扩容方案是： 依靠Bucker的回调函数(CallBucket)， 当调用回调函数的Bucket内存小于阈值(10 KB) 

* 优化选取Bucket:
    * 当前是遍历triemap(bucket map)， 找到合适的返回给前端
    * 需要注意的是： 
      * [WARNNING]  在call back执行完后，如果生成了新的bucket,旧的bucket并没有从bucket map中移除，需要将bucketmap 分为available map 和 unavailable map。
      * 可行的想法： 
        * bucketStatus增加avl : Bool，找的时候加上if(avl)。 
        * 寻找bucket的时候，先从用户之前存储的bucket里面找，没找到再从available bucket map找 

- 优化选取Bucket Solution [hyx]:
  - 当前是遍历triemap(bucket map)， 找到合适的返回给前端
  - 需要注意的是：
    - 【1】available mat & unavailable set 
      -  在call back执行完后，如果生成了新的bucket,旧的bucket并没有从bucket map中移除，需要将bucketmap 分为available map 和 unavailable set。
    - 【2】 寻找bucket的时候，先从用户之前存储的bucket里面找，没找到再从available bucket map找
    - Next 版本 ： 
      - RBTree Map : available memory - Bucket Principal 
        - 修改status后，要重新修改
      - 分类 ： 大文件， 小文件
      - 碎内存，僵局
      - 访问优化： bucket加上访问流大小控制
      - 加上queue_size : Nat, 当有存储任务时， +1， call back返回任务执行完毕后， - 1
      - 公共内存池，用户每次根据文件大小选取部分bucket，需要连续内存解决？没用完的完整的bucket才返回公共内存池


  * 优化获取Bucket方法
    * 现阶段是传size，container扣除size， 然后返回bucket给前端
    * 有点慢，可以想一下是否可以有一个办法： 既能避免不修改bucket available memory的情况，错误地将内存不够的bucket分配给前端，又能快速分配给前端bucket
  * 访问优化： bucket加上消息队列/访问流大小控制

  

  ### 还需要做的功能

  * 自动续费（ICP - Cycles）
  * NSMBucket 管理（和Bucket一样）
