type Bucket<T> = { minute: number; value: T }

function currentMinute() {
    return Math.floor(Date.now() / 60_000)
}

export class SlidingWindow<T> {
    private buckets: Bucket<T>[]
    constructor(
        private minutes: number,
        private start: T,
    ) {
        this.buckets = Array.from({ length: minutes }, () => ({ minute: 0, value: start }))
    }

    now(): T {
        const m = currentMinute();
        const idx = m % this.minutes;
        const b = this.buckets[idx];
        if (b.minute !== m) {
            b.minute = m;
            b.value = this.start;
        }
        return b.value;
    }

    last(lastMins: number): T[] {
        lastMins = Math.min(this.minutes, lastMins);
        const nowMin = currentMinute();
        return this.buckets.filter(x => x.minute > nowMin - lastMins).map(y => y.value);
    }
}