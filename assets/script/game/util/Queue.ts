interface IQueue<T> {
    enqueue(item: T): void;
    dequeue(): T;
    size(): number;
    isEmpty(): boolean;
    clear(): void;
}

export default class Queue<T> implements IQueue<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) { }

    enqueue(item: T): void {
        if (this.size() === this.capacity) {
            throw Error("Queue has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }

    dequeue(): T | undefined {
        return this.storage.shift();
    }

    size(): number {
        return this.storage.length;
    }

    isEmpty(): boolean {
        return this.size() == 0;
    }

    clear(): void {
        this.storage.length = 0;
    }
}