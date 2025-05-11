export interface VIDEOPARAMS {
  srid?: number;
  ac?: string;
  h?: number;
  ids?: string;
  limit?: number;
  op?: string;
  page?: number;
  pagesize?: number;
  pg?: number;
  ps?: number;
  t?: number;
  wd?: string;
}

export class VideoParams {
  private total = 0;
  private srid = 0;
  private ac = 'videolist';
  private h = undefined;
  private ids = '';
  private limit = 0;
  private op = 'all';
  private page = 1;
  private pagesize = 0;
  private pg = 1;
  private ps = 0;
  private t = 0;
  private wd = '';
  private pagecount = 0;

  getSrid(): number {
    return this.srid;
  }

  setSrid(value: number): void {
    this.srid = value;
  }

  getAc(): string {
    return this.ac;
  }

  setAc(value: string): void {
    this.ac = value;
  }

  getH(): number {
    return this.h;
  }

  setH(value: number): void {
    this.h = value;
  }

  getIds(): string {
    return this.ids;
  }

  setIds(value: string): void {
    this.ids = value;
  }

  getLimit(): number {
    return this.limit;
  }

  setLimit(value: number): void {
    this.limit = value;
  }

  getOp(): string {
    return this.op;
  }

  setOp(value: string): void {
    this.op = value;
  }

  getPage(): number {
    return this.page;
  }

  setPage(value: number): void {
    this.page = value;
  }

  getPagesize(): number {
    return this.pagesize;
  }

  setPagesize(value: number): void {
    this.pagesize = value;
  }

  getPg(): number {
    return this.pg;
  }

  setPg(value: number): void {
    this.pg = value;
  }

  getPs(): number {
    return this.ps;
  }

  setPs(value: number): void {
    this.ps = value;
  }

  getT(): number {
    return this.t;
  }

  setT(value: number): void {
    this.t = value;
  }

  getWd(): string {
    return this.wd;
  }

  setWd(value: string): void {
    this.wd = value;
  }

  setTotal(total: number) {
    this.total = total;
  }

  getTotal(): number {
    return this.total;
  }

  setPagecount(pagecount: number) {
    this.pagecount = pagecount;
  }

  getPagecount(): number {
    return this.pagecount;
  }

  getObject(): VIDEOPARAMS {
    return {
      srid: this.srid,
      ac: this.ac,
      h: this.h,
      ids: this.ids,
      limit: this.limit,
      op: this.op,
      page: this.page,
      pagesize: this.pagesize,
      pg: this.pg,
      ps: this.ps,
      t: this.t,
      wd: this.wd,
    };
  }

  /**
   * 获取视频列表查询字符串
   * @returns 返回查询字符串
   */
  getQueryString(): string {
    return `Srid=${this.srid}&ac=${this.ac}&h=${this.h}&ids=${this.ids}&limit=${this.limit}&op=${this.op}&page=${this.page}&pagesize=${this.pagesize}&pg=${this.pg}&ps=${this.ps}&t=${this.t}&wd=${this.wd}`;
  }
}
