import { SlidingWindow } from "./SlidingWindow.js";

type CounterMetric = {
  value: number;
};
type HistogramMetric = {
  count: number;
  sum: number;
  min: number;
  max: number;
};

export class Stats {
  private counterWindows = new Map<string, SlidingWindow<CounterMetric>>();
  private histogramWindows = new Map<string, SlidingWindow<HistogramMetric>>();

  inc(name: string, value = 1) {
    this.getCounterWindow(name).now().value += value;
  }


  observe(name: string, value: number) {
    const metric = this.getHistogramWindow(name).now();
    metric.count++;
    metric.sum += value;
    metric.max = Math.max(metric.max, value);
    metric.min = Math.min(metric.min, value);
  }

  getCounterSummary(name: string, lastNMinutes = 60) {
    this.getCounterWindow(name).last(lastNMinutes);

  }

  private getCounterWindow(k: string) {
    let w = this.counterWindows.get(k)
    if (!w) {
      w = new SlidingWindow<CounterMetric>(60, { value: 0 })
      this.counterWindows.set(k, w)
    }
    return w
  }

  private getHistogramWindow(k: string) {
    let w = this.histogramWindows.get(k)
    if (!w) {
      w = new SlidingWindow<HistogramMetric>(60, {
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
      })
      this.histogramWindows.set(k, w)
    }
    return w
  }
}
