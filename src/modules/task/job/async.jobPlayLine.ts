/**
 * @Author: 17691002584 17691002584@163.com
 * @Date: 2026-02-02 15:55:14
 * @LastEditors: 17691002584 17691002584@163.com
 * @LastEditTime: 2026-02-03 01:14:42
 * @FilePath: src/modules/task/job/async.jobPlayLine.ts
 * @Description: 播放线路合并定时任务，每10分钟执行一次
 */

import {IJob, Job} from '@midwayjs/cron';
import {Inject, Logger} from '@midwayjs/core';
import {BaseService} from "@cool-midway/core";
import {ILogger} from "@midwayjs/logger";
import {PlayLineService} from "../../video/service/play_line";
import {InjectEntityModel} from "@midwayjs/typeorm";
import {TaskLogEntity} from "../entity/log";
import {Repository} from "typeorm";

const TAG = 'JobPlayLine';

@Job("syncJob", {
    cronTime: "0 0 */8 * * *", // 每6小时执行一次
    start: true,
})
export class JobPlayLine extends BaseService implements IJob {
    @Logger()
    logger: ILogger;

    @InjectEntityModel(TaskLogEntity)
    taskLogEntity: Repository<TaskLogEntity>;

    @Inject()
    playLineService: PlayLineService;

    // 定义固定的任务ID，避免硬编码
    private readonly PLAYLINE_TASK_ID = 14;

    // 标识是否正在执行播放线路任务，防止任务重叠
    private isExecuting = false;

    async onTick() {
        // 检查是否已有任务在执行，如果有则跳过本次执行
        if (this.isExecuting) {
            this.logger.info(TAG, "播放线路合并任务正在执行中，跳过本次执行");
            return;
        }

        this.logger.info(TAG, "播放线路合并任务开始执行");

        // 设置执行标志
        this.isExecuting = true;

        // 在后台异步执行播放线路任务，不阻塞定时任务的执行周期
        this.executePlayLineTask()
            .then(async () => {
                await this.recordTaskLog("播放线路合并任务执行成功", 1);
                this.logger.info(TAG, "播放线路合并任务执行成功");
            })
            .catch(async (error) => {
                await this.recordTaskLog(`播放线路合并任务执行失败: ${error.message}`, 0);
                this.logger.error(TAG, "播放线路合并任务执行失败:", error);
            })
            .finally(() => {
                // 重置执行标志
                this.isExecuting = false;
            });
    }

    /**
     * 执行播放线路任务（在后台运行）
     */
    private async executePlayLineTask(): Promise<void> {
        try {
            await this.playLineService.merge();
        } catch (error) {
            throw error;
        }
    }

    /**
     * 记录任务日志
     * @param detail 日志详情
     * @param status 任务状态 (0-失败 1-成功)
     */
    private async recordTaskLog(detail: string, status: number) {
        try {
            await this.taskLogEntity.insert({
                detail: detail,
                status: status,
                taskId: this.PLAYLINE_TASK_ID,
            });
        } catch (logError) {
            // 如果记录日志也失败，至少要在控制台输出
            this.logger.error(TAG, "记录任务日志失败:", logError);
        }
    }
}
