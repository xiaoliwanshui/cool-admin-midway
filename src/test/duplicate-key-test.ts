/**
 * 重复键冲突处理测试脚本
 * 验证视频采集中重复键冲突的处理是否正确
 */

import { DuplicateKeyHandler } from '../modules/video/service/duplicateKeyHandler';
import { VideosService } from '../modules/video/service/videos';
import { VideoEntity } from '../modules/video/entity/videos';

export class DuplicateKeyTest {
  
  /**
   * 模拟重复键冲突测试
   */
  async testDuplicateKeyHandling() {
    console.log('开始测试重复键冲突处理...');
    
    // 模拟重复键错误对象
    const duplicateError1 = {
      code: 'ER_DUP_ENTRY',
      errno: 1062,
      sqlState: '23000',
      message: "Duplicate entry '狗狗的疯狂假期' for key 'video.IDX_99e2178fda31ff2d6576447368'"
    };
    
    const duplicateError2 = {
      driverError: { code: 'ER_DUP_ENTRY' },
      message: "Duplicate entry '测试视频' for key 'video.title'"
    };
    
    const normalError = {
      code: 'ECONNREFUSED',
      message: 'Connection refused'
    };
    
    const handler = new DuplicateKeyHandler();
    
    // 测试重复键错误检测
    console.log('\n1. 测试重复键错误检测:');
    console.log('   duplicateError1:', handler.isDuplicateKeyError(duplicateError1)); // 应该是 true
    console.log('   duplicateError2:', handler.isDuplicateKeyError(duplicateError2)); // 应该是 true
    console.log('   normalError:', handler.isDuplicateKeyError(normalError)); // 应该是 false
    
    // 测试提取重复键值
    console.log('\n2. 测试提取重复键值:');
    console.log('   从错误1提取:', handler.extractDuplicateKey(duplicateError1)); // 应该是 '狗狗的疯狂假期'
    console.log('   从错误2提取:', handler.extractDuplicateKey(duplicateError2)); // 应该是 '测试视频'
    console.log('   从普通错误提取:', handler.extractDuplicateKey(normalError)); // 应该是 null
    
    console.log('\n✓ 重复键检测功能测试完成');
  }
  
  /**
   * 测试错误分类功能
   */
  testErrorClassification() {
    console.log('\n3. 测试错误分类功能:');
    
    const testCases = [
      {
        name: '标准重复键错误',
        error: { code: 'ER_DUP_ENTRY', errno: 1062 },
        expectedDuplicate: true
      },
      {
        name: '消息中包含Duplicate entry',
        error: { message: "Duplicate entry 'test' for key 'idx'" },
        expectedDuplicate: true
      },
      {
        name: '驱动器错误中的重复键',
        error: { driverError: { code: 'ER_DUP_ENTRY' } },
        expectedDuplicate: true
      },
      {
        name: '普通连接错误',
        error: { code: 'ECONNREFUSED' },
        expectedDuplicate: false
      },
      {
        name: '数据过长错误',
        error: { message: 'Data too long for column' },
        expectedDuplicate: false
      }
    ];
    
    const handler = new DuplicateKeyHandler();
    
    testCases.forEach(testCase => {
      const result = handler.isDuplicateKeyError(testCase.error);
      const status = result === testCase.expectedDuplicate ? '✓' : '✗';
      console.log(`   ${status} ${testCase.name}: ${result}`);
    });
  }
  
  /**
   * 生成测试视频数据
   */
  generateTestVideoData(title: string): Partial<VideoEntity> {
    return {
      title: title,
      sub_title: '测试副标题',
      video_tag: '测试,标签',
      video_class: '测试分类',
      category_id: 1,
      category_pid: 0,
      surface_plot: 'https://example.com/image.jpg',
      directors: '测试导演',
      actors: '测试演员',
      introduce: '这是一个测试视频的简介',
      year: 2024,
      status: 1,
      collection_id: 1,
      collection_name: '测试采集源',
      sort: 0
    };
  }
  
  /**
   * 显示测试建议
   */
  showTestRecommendations() {
    console.log('\n4. 测试建议和最佳实践:');
    console.log('   ✓ 使用事务确保数据一致性');
    console.log('   ✓ 实现重试机制处理并发冲突');
    console.log('   ✓ 详细记录错误日志便于调试');
    console.log('   ✓ 使用批量处理减少数据库压力');
    console.log('   ✓ 实现优雅降级避免系统崩溃');
    
    console.log('\n5. 监控指标建议:');
    console.log('   • 重复键冲突发生频率');
    console.log('   • 冲突处理成功率');
    console.log('   • 平均处理时间');
    console.log('   • 数据库锁等待时间');
    console.log('   • 内存使用情况');
  }
  
  /**
   * 运行完整测试
   */
  async runFullTest() {
    console.log('='.repeat(60));
    console.log('重复键冲突处理功能测试');
    console.log('='.repeat(60));
    
    try {
      await this.testDuplicateKeyHandling();
      this.testErrorClassification();
      this.showTestRecommendations();
      
      console.log('\n='.repeat(60));
      console.log('✓ 所有测试完成！');
      console.log('='.repeat(60));
      
    } catch (error) {
      console.error('✗ 测试过程中发生错误:', error);
    }
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  const test = new DuplicateKeyTest();
  test.runFullTest().catch(console.error);
}