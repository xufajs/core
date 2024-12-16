class SimpleTimer {
  constructor(settings = {}) {
    this.resolution = settings.resolution || process.env.TIMER_RESOLUTION || 5000;
    this.tasks = [];
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.scheduleNextTick();
  }

  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  scheduleNextTick() {
    if (this.isRunning) {
      this.timer = setTimeout(() => {
        this.executeTick().then(() => {
          this.scheduleNextTick();
        });
      }, this.resolution);
    }
  }

  async executeTick() {
    let i = 0;
    while (i < this.tasks.length) {
      const task = this.tasks[i];
      let increment = 1;
      if (task.inmediate || !task.lastExecuted || Date.now() - task.lastExecuted >= task.interval) {
        // eslint-disable-next-line no-await-in-loop
        await task.callback();
        task.lastExecuted = Date.now();
        if (task.oneShot) {
          this.tasks.splice(i, 1);
          increment = 0;
        }
        if (task.inmediate) {
          task.inmediate = false;
        }
      }
      i += increment;
    }
  }

  addTask(cb, interval = 60, oneShot = false, inmediate = false) {
    const task = {
      callback: cb,
      lastExecuted: Date.now(),
      interval: interval * 1000,
      oneShot,
      inmediate,
    };
    this.tasks.push(task);
  }
}

module.exports = { SimpleTimer };
