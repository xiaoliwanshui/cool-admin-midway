/**
 * 视频采集测试脚本
 * 用于验证视频采集和入库功能的修复效果
 */

import { App, Configuration } from '@midwayjs/core';
import { Application } from '@midwayjs/koa';
import { TaskCollectService } from '../modules/task/service/collect';
import { CollectionService } from '../modules/video/service/collection';
import { VideosService } from '../modules/video/service/videos';

@Configuration({
  imports: [],
})
export class VideoCollectionTestConfiguration {}

export class VideoCollectionTest {
  @App()
  app: Application;

  async testVideoCollection() {
    console.log('开始测试视频采集功能...');
    
    try {
      // 获取服务实例
      const taskCollectService = await this.app.getApplicationContext().getAsync<TaskCollectService>('taskCollectService');
      const collectionService = await this.app.getApplicationContext().getAsync<CollectionService>('collectionService');
      const videosService = await this.app.getApplicationContext().getAsync<VideosService>('videosService');
      
      console.log('✓ 服务实例获取成功');
      
      // 测试诊断功能
      console.log('\n1. 执行系统诊断...');
      const diagnosis = await taskCollectService.diagnosisCollection();
      console.log('诊断结果:', JSON.stringify(diagnosis, null, 2));
      
      // 测试Redis状态
      console.log('\n2. 检查Redis状态...');
      if (diagnosis.redisStatus.connected) {
        console.log('✓ Redis连接正常');
        console.log(`队列长度: ${diagnosis.redisStatus.queueLength}`);
      } else {
        console.log('✗ Redis连接失败');
        return;
      }
      
      // 检查采集源配置
      console.log('\n3. 检查采集源配置...');
      const sources = diagnosis.collectionSources;
      console.log(`找到 ${sources.length} 个采集源`);
      
      sources.forEach((source, index) => {
        console.log(`${index + 1}. ${source.collection_name} (ID: ${source.collection_id})`);
        console.log(`   地址: ${source.address}`);
        console.log(`   状态: ${source.status}`);
        console.log(`   分类映射: ${source.category_count} 个`);
        
        if (source.category_count === 0) {
          console.log('   ⚠️  警告: 未配置分类映射');
        }
      });
      
      // 测试采集功能（如果有可用的采集源）
      if (sources.length > 0 && sources[0].category_count > 0) {
        console.log('\n4. 测试采集功能...');
        const testSourceId = sources[0].collection_id;
        
        try {
          console.log(`使用采集源 ${testSourceId} 进行测试...`);
          await taskCollectService.day(testSourceId);
          console.log('✓ 采集任务执行成功');
        } catch (error) {
          console.log('✗ 采集任务执行失败:', error.message);
        }
      } else {
        console.log('\n4. 跳过采集测试 - 没有可用的采集源或分类映射');
      }
      
      // 检查最近的任务执行情况
      console.log('\n5. 检查最近的任务执行情况...');
      const recentTasks = diagnosis.recentTasks;
      if (recentTasks.length > 0) {
        console.log(`最近 ${recentTasks.length} 个任务:`);
        recentTasks.slice(0, 5).forEach((task, index) => {
          console.log(`${index + 1}. ${task.taskName}`);
          console.log(`   状态: ${task.taskStatus === 1 ? '执行中' : task.taskStatus === 2 ? '成功' : '失败'}`);
          console.log(`   开始时间: ${task.startDate}`);
          console.log(`   结束时间: ${task.endDate}`);
          if (task.errorMessage) {
            console.log(`   错误信息: ${task.errorMessage}`);
          }
        });
      } else {
        console.log('没有找到最近的任务记录');
      }
      
      // 系统健康检查
      console.log('\n6. 系统健康状态...');
      const health = diagnosis.systemHealth as any;
      if (health && health.memory) {
        console.log(`内存使用: ${health.memory.heapUsed} / ${health.memory.heapTotal}`);
        console.log(`运行时间: ${health.uptime}`);
      } else {
        console.log('系统健康信息不可用');
      }
      
      console.log('\n✓ 测试完成！');
      
    } catch (error) {
      console.error('✗ 测试过程中发生错误:', error);
    }
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  const test = new VideoCollectionTest();
  test.testVideoCollection().catch(console.error);
}