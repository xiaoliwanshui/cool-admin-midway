interface VIDEOBEAN {
  title?: string;
  category_pid?: number;
  category_child_id?: number;
  surface_plot?: string;
  recommend?: number;
  cycle?: number;
  cycle_img?: string;
  charging_mode?: number;
  buy_mode?: number;
  gold?: number;
  directors?: string;
  actors?: string;
  imdb_score?: number;
  imdb_score_id?: string;
  introduce?: string;
  popularity_day?: number;
  popularity_week?: number;
  popularity_month?: number;
  popularity_sum?: number;
  note?: string;
  year?: string;
  status?: number;
  create_at?: number;
  update_at?: number;
  duration?: number;
  region?: string;
  language?: string;
  label?: string;
  number?: number;
  total?: number;
  horizontal_poster?: string;
  vertical_poster?: string;
  publish?: string;
  serial_number?: string;
  screenshot?: string;
  gif?: string;
  alias?: string;
  release_at?: number;
  shelf_at?: number;
  end?: number;
  unit?: string;
  watch?: number;
  collection_id?: number;
  use_local_image?: number;
  titles_time?: number;
  trailer_time?: number;
  site_id?: number;
  category_pid_status?: number;
  category_child_id_status?: number;
  play_url?: string;
  play_url_put_in?: number;
  createTime?: string;
  updateTime?: string;
  createUserId?: null | number;
  updateUserId?: null | number;
  id?: number;
  douban_score_id?: null | number;
  album_id?: null | number;
  douban_score?: number;
}

export class VideoBean {
  private title?: string;
  private category_pid?: number;
  private category_child_id?: number;
  private surface_plot?: string;
  private recommend?: number;
  private cycle?: number;
  private cycle_img?: string;
  private charging_mode?: number;
  private buy_mode?: number;
  private gold?: number;
  private directors?: string;
  private actors?: string;
  private imdb_score?: number;
  private imdb_score_id?: string;
  private introduce?: string;
  private popularity_day?: number;
  private popularity_week?: number;
  private popularity_month?: number;
  private popularity_sum?: number;
  private note?: string;
  private year?: string;
  private status?: number;
  private create_at?: number;
  private update_at?: number;
  private duration?: number;
  private region?: string;
  private language?: string;
  private label?: string;
  private number?: number;
  private total?: number;
  private horizontal_poster?: string;
  private vertical_poster?: string;
  private publish?: string;
  private serial_number?: string;
  private screenshot?: string;
  private gif?: string;
  private alias?: string;
  private release_at?: number;
  private shelf_at?: number;
  private end?: number;
  private unit?: string;
  private watch?: number;
  private collection_id?: number;
  private use_local_image?: number;
  private titles_time?: number;
  private trailer_time?: number;
  private site_id?: number;
  private category_pid_status?: number;
  private category_child_id_status?: number;
  private play_url?: string;
  private play_url_put_in?: number;
  private createUserId?: null | number;
  private updateUserId?: null | number;
  private id?: number;
  private douban_score_id?: null | number;
  private album_id?: null | number;
  private douban_score?: number;
  private olderId?: number;

  getTitle(): string {
    return this.title;
  }

  setTitle(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.title = value;
    }
  }

  getCategoryPid(): number {
    return this.category_pid;
  }

  setCategoryPid(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.category_pid = value;
    }
  }

  getCategoryChildId(): number {
    return this.category_child_id;
  }

  setCategoryChildId(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.category_child_id = value;
    }
  }

  getSurfacePlot(): string {
    return this.surface_plot;
  }

  setSurfacePlot(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.surface_plot = value;
    }
  }

  getRecommend(): number {
    return this.recommend;
  }

  setRecommend(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.recommend = value;
    }
  }

  getCycle(): number {
    return this.cycle;
  }

  setCycle(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.cycle = value;
    }
  }

  getCycleImg(): string {
    return this.cycle_img;
  }

  setCycleImg(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.cycle_img = value;
    }
  }

  getChargingMode(): number {
    return this.charging_mode;
  }

  setChargingMode(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.charging_mode = value;
    }
  }

  getBuyMode(): number {
    return this.buy_mode;
  }

  setBuyMode(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.buy_mode = value;
    }
  }

  getGold(): number {
    return this.gold;
  }

  setGold(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.gold = value;
    }
  }

  getDirectors(): string {
    return this.directors;
  }

  setDirectors(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.directors = value;
    }
  }

  getActors(): string {
    return this.actors;
  }

  setActors(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.actors = value;
    }
  }

  getImdbScore(): number {
    return this.imdb_score;
  }

  setImdbScore(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.imdb_score = value;
    }
  }

  getImdbScoreId(): string {
    return this.imdb_score_id;
  }

  setImdbScoreId(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.imdb_score_id = value;
    }
  }

  getIntroduce(): string {
    return this.introduce;
  }

  setIntroduce(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.introduce = value;
    }
  }

  getPopularityDay(): number {
    return this.popularity_day;
  }

  setPopularityDay(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.popularity_day = value;
    }
  }

  getPopularityWeek(): number {
    return this.popularity_week;
  }

  setPopularityWeek(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.popularity_week = value;
    }
  }

  getPopularityMonth(): number {
    return this.popularity_month;
  }

  setPopularityMonth(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.popularity_month = value;
    }
  }

  getPopularitySum(): number {
    return this.popularity_sum;
  }

  setPopularitySum(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.popularity_sum = value;
    }
  }

  getNote(): string {
    return this.note;
  }

  setNote(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.note = value;
    }
  }

  getYear(): string {
    return this.year;
  }

  setYear(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.year = value;
    }
  }

  getStatus(): number {
    return this.status;
  }

  setStatus(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.status = value;
    }
  }

  getCreateAt(): number {
    return this.create_at;
  }

  setCreateAt(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.create_at = value;
    }
  }

  getUpdateAt(): number {
    return this.update_at;
  }

  setUpdateAt(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.update_at = value;
    }
  }

  getDuration(): number {
    return this.duration;
  }

  setDuration(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.duration = value;
    }
  }

  getRegion(): string {
    return this.region;
  }

  setRegion(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.region = value;
    }
  }

  getLanguage(): string {
    return this.language;
  }

  setLanguage(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.language = value;
    }
  }

  getLabel(): string {
    return this.label;
  }

  setLabel(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.label = value;
    }
  }

  getNumber(): number {
    return this.number;
  }

  setNumber(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.number = value;
    }
  }

  getTotal(): number {
    return this.total;
  }

  setTotal(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.total = value;
    }
  }

  getHorizontalPoster(): string {
    return this.horizontal_poster;
  }

  setHorizontalPoster(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.horizontal_poster = value;
    }
  }

  getVerticalPoster(): string {
    return this.vertical_poster;
  }

  setVerticalPoster(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.vertical_poster = value;
    }
  }

  getPublish(): string {
    return this.publish;
  }

  setPublish(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.publish = value;
    }
  }

  getSerialNumber(): string {
    return this.serial_number;
  }

  setSerialNumber(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.serial_number = value;
    }
  }

  getScreenshot(): string {
    return this.screenshot;
  }

  setScreenshot(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.screenshot = value;
    }
  }

  getGif(): string {
    return this.gif;
  }

  setGif(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.gif = value;
    }
  }

  getAlias(): string {
    return this.alias;
  }

  setAlias(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.alias = value;
    }
  }

  getReleaseAt(): number {
    return this.release_at;
  }

  setReleaseAt(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.release_at = value;
    }
  }

  getShelfAt(): number {
    return this.shelf_at;
  }

  setShelfAt(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.shelf_at = value;
    }
  }

  getEnd(): number {
    return this.end;
  }

  setEnd(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.end = value;
    }
  }

  getUnit(): string {
    return this.unit;
  }

  setUnit(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.unit = value;
    }
  }

  getWatch(): number {
    return this.watch;
  }

  setWatch(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.watch = value;
    }
  }

  getCollectionId(): number {
    return this.collection_id;
  }

  setCollectionId(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.collection_id = value;
    }
  }

  getUseLocalImage(): number {
    return this.use_local_image;
  }

  setUseLocalImage(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.use_local_image = value;
    }
  }

  getTitlesTime(): number {
    return this.titles_time;
  }

  setTitlesTime(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.titles_time = value;
    }
  }

  getTrailerTime(): number {
    return this.trailer_time;
  }

  setTrailerTime(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.trailer_time = value;
    }
  }

  getSiteId(): number {
    return this.site_id;
  }

  setSiteId(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.site_id = value;
    }
  }

  getCategoryPidStatus(): number {
    return this.category_pid_status;
  }

  setCategoryPidStatus(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.category_pid_status = value;
    }
  }

  getCategoryChildIdStatus(): number {
    return this.category_child_id_status;
  }

  setCategoryChildIdStatus(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.category_child_id_status = value;
    }
  }

  getPlayUrl(): string {
    return this.play_url;
  }

  setPlayUrl(value: string): void {
    if (typeof value === 'string' && value.trim() !== '') {
      this.play_url = value;
    }
  }

  getPlayUrlPutIn(): number {
    return this.play_url_put_in;
  }

  setPlayUrlPutIn(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.play_url_put_in = value;
    }
  }

  getCreateUserId(): null | number {
    return this.createUserId;
  }

  setCreateUserId(value: null | number): void {
    if (value === null || (typeof value === 'number' && value >= 0)) {
      this.createUserId = value;
    }
  }

  getUpdateUserId(): null | number {
    return this.updateUserId;
  }

  setUpdateUserId(value: null | number): void {
    if (value === null || (typeof value === 'number' && value >= 0)) {
      this.updateUserId = value;
    }
  }

  getId(): number {
    return this.id;
  }

  setId(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.id = value;
    }
  }

  getDoubanScoreId(): null | number {
    return this.douban_score_id;
  }

  setDoubanScoreId(value: null | number): void {
    if (value === null || (typeof value === 'number' && value >= 0)) {
      this.douban_score_id = value;
    }
  }

  getAlbumId(): null | number {
    return this.album_id;
  }

  setAlbumId(value: null | number): void {
    if (value === null || (typeof value === 'number' && value >= 0)) {
      this.album_id = value;
    }
  }

  getDoubanScore(): number {
    return this.douban_score;
  }

  setDoubanScore(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.douban_score = value;
    }
  }

  getOlderId(): number {
    return this.olderId;
  }

  setOlderId(value: number): void {
    if (typeof value === 'number' && value >= 0) {
      this.olderId = value;
    }
  }

  /**
   * 获取视频信息
   * @returns 返回视频信息的字符串表示
   */
  getVideoInfo(): string {
    return `Title: ${this.title}, Year: ${this.year}, Directors: ${this.directors}, Actors: ${this.actors}, Introduce: ${this.introduce}`;
  }
}
