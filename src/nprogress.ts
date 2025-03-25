import type { AccessDecision, AccessContext, AccessManager, AccessPath, AccessResource } from '@lanaqi/rsr';
import { AbstractAddon } from '@lanaqi/rsr';

import NProgress, { type NProgressOptions } from 'nprogress';

import 'nprogress/nprogress.css';

/**
 * NProgress 插件实现
 */
export class NProgressAddon extends AbstractAddon {
  /**
   * NProgress 实例
   * @private
   */
  private readonly progress: NProgress.NProgress;

  /**
   * 超时时间
   * @private
   */
  private readonly timeout: number;

  /**
   * 超时清理
   * @private
   */
  private clear?: number;

  /**
   * 构造函数
   * @param progress NProgress 实例
   * @param timeout 超时时间
   */
  public constructor(progress: NProgress.NProgress, timeout: number) {
    super();
    this.progress = progress;
    this.timeout = timeout;
    this.clear = undefined;
  }

  /**
   * 守护之前
   * @param context 上下文
   * @param manager 管理器
   * @param currentPath 当前路径
   * @param currentResource 当前资源
   * @override
   */
  public guardBefore(context: AccessContext, manager: AccessManager, currentPath: AccessPath, currentResource: AccessResource | null): void {
    if (!this.progress.isStarted()) {
      this.progress.start();
      if (this.clear) {
        clearTimeout(this.clear);
      }
      this.clear = setTimeout(() => {
        if (this.progress.isStarted()) {
          this.progress.done();
        }
      }, this.timeout);
    }
  }

  /**
   * 守护之后
   * @param context 上下文
   * @param manager 管理器
   * @param currentPath 当前路径
   * @param currentResource 当前资源
   * @param currentDecision 当前决策
   * @override
   */
  public guardAfter(
    context: AccessContext,
    manager: AccessManager,
    currentPath: AccessPath,
    currentResource: AccessResource | null,
    currentDecision: AccessDecision,
  ): void {
    if (this.progress.isStarted()) {
      this.progress.done();
    }
    if (this.clear) {
      clearTimeout(this.clear);
      this.clear = undefined;
    }
  }
}

/**
 * NProgress 插件函数
 * @param config NProgress 可选配置
 * @param timeout 超时时间，默认 15 * 1000 毫秒
 */
export const nProgressAddon = (config?: Partial<NProgressOptions>, timeout = 15 * 1000) => {
  let options: Partial<NProgressOptions>;
  if (!config) {
    options = {
      showSpinner: false,
      easing: 'ease',
      speed: 200,
      trickleSpeed: 100,
    };
  } else {
    options = config;
  }
  const progress = NProgress.configure(options);
  return new NProgressAddon(progress, timeout);
};
