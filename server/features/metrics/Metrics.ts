type CounterMetric = {
  value: number;
};
type GaugeMetric = {
  value: number;
};
type HistogramMetric = {
  count: number;
  sum: number;
  min: number;
  max: number;
};

export class Stats {
  private counters = new Map<string, CounterMetric>();
  private gauges = new Map<string, GaugeMetric>();
  private histograms = new Map<string, HistogramMetric>();

  inc(name: string, value = 1) {
    const currentValue: CounterMetric = this.counters.get(name) ?? {
      value: 0,
    };
    currentValue.value += value;
    this.counters.set(name, currentValue);
  }

  set(name: string, value: number) {
    this.gauges.set(name, { value: value });
  }

  observe(name: string, value: number) {
    const currentValue: HistogramMetric = this.histograms.get(name) ?? {
      count: 0,
      sum: 0,
      min: Infinity,
      max: -Infinity,
    };

    currentValue.count++;
    currentValue.sum += value;
    currentValue.max = Math.max(currentValue.max, value);
    currentValue.min = Math.min(currentValue.min, value);

    this.histograms.set(name, currentValue);
  }
}
