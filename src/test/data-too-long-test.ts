import { DuplicateKeyHandler } from '../modules/video/service/duplicateKeyHandler';
import { VideoEntity } from '../modules/video/entity/videos';

// 简单的日志模拟器
class MockLogger {
  debug(tag: string, message: string, ...args: any[]) {
    console.log(`[DEBUG] ${tag}: ${message}`, ...args);
  }
  
  info(tag: string, message: string, ...args: any[]) {
    console.log(`[INFO] ${tag}: ${message}`, ...args);
  }
  
  warn(tag: string, message: string, ...args: any[]) {
    console.log(`[WARN] ${tag}: ${message}`, ...args);
  }
  
  error(tag: string, message: string, ...args: any[]) {
    console.log(`[ERROR] ${tag}: ${message}`, ...args);
  }
}

// 测试数据长度超限处理
async function testDataTooLongHandling() {
  const handler = new DuplicateKeyHandler();
  handler.logger = new MockLogger() as any;

  console.log('=== 数据长度超限错误处理测试 ===\n');

  // 模拟数据长度超限错误
  const dataTooLongError = {
    code: 'ER_DATA_TOO_LONG',
    errno: 1406,
    sqlState: '22001',
    message: "Data too long for column 'sub_title' at row 1",
    driverError: {
      code: 'ER_DATA_TOO_LONG'
    }
  };

  // 测试1: 检测数据长度超限错误
  console.log('测试1: 检测数据长度超限错误');
  const isDataTooLong = handler.isDataTooLongError(dataTooLongError);
  console.log(`✅ 数据长度超限错误检测: ${isDataTooLong ? '正确识别' : '识别失败'}\n`);

  // 测试2: 提取超长字段名
  console.log('测试2: 提取超长字段名');
  const columnName = handler.extractTooLongColumn(dataTooLongError);
  console.log(`✅ 提取字段名: ${columnName || '提取失败'}\n`);

  // 测试3: 字段数据截断
  console.log('测试3: 字段数据截断');
  const testVideoData: Partial<VideoEntity> = {
    title: '基督山伯爵',
    sub_title: '导演: 亚历山大·德·拉·巴特里耶 / 马修·德拉波特 编剧: 马修·德拉波特 / 大仲马 / 亚历山大·德·拉·巴特里耶 主演: 皮埃尔·尼内 / 阿娜伊斯·德穆斯蒂埃 / 皮耶尔弗兰切斯科·法维诺 / 安娜玛丽亚·沃特鲁梅 / 奥斯卡·莱斯格 / 罗兰·拉斐特 / 瓦西里·施耐德 / 朱利安·德·圣·让 / 巴斯蒂安·布永 / 帕特里克·米勒',
    video_tag: '剧情,动作,爱情,惊悚,历史,冒险',
    video_class: '剧情,动作,爱情,惊悚,历史,冒险'
  };

  console.log(`原始sub_title长度: ${testVideoData.sub_title?.length}`);
  
  // 私有方法测试需要通过反射访问
  const truncatedData = (handler as any).truncateFieldData(testVideoData, 'sub_title');
  console.log(`截断后sub_title长度: ${truncatedData.sub_title?.length}`);
  console.log(`截断后内容: ${truncatedData.sub_title?.substring(0, 100)}...`);

  // 测试4: 不同错误类型的区分
  console.log('\n测试4: 错误类型区分');
  
  const duplicateKeyError = {
    code: 'ER_DUP_ENTRY',
    errno: 1062,
    message: "Duplicate entry '基督山伯爵' for key 'video.IDX_99e2178fda31ff2d6576447368'"
  };
  
  const isDuplicate = handler.isDuplicateKeyError(duplicateKeyError);
  const isDataTooLong2 = handler.isDataTooLongError(duplicateKeyError);
  
  console.log(`重复键错误检测: ${isDuplicate ? '✅ 正确' : '❌ 错误'}`);
  console.log(`数据超长错误检测: ${!isDataTooLong2 ? '✅ 正确' : '❌ 错误'}`);

  console.log('\n=== 测试完成 ===');
}

// 运行测试
if (require.main === module) {
  testDataTooLongHandling().catch(console.error);
}

export { testDataTooLongHandling };