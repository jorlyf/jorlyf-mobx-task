import { observable, runInAction } from "mobx";

interface ITaskOptions {
  throw: boolean;
}

type States = "initial" | "pending" | "resolved" | "rejected";

interface ITaskState<TReturn> {
  state: States;
  result: TReturn;
  error: any;
  initial: boolean;
  pending: boolean;
  resolved: boolean;
  rejected: boolean;
}

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;
type AsyncFn = (...args: any[]) => Promise<any>;

interface ITask<Function extends AsyncFn> extends ITaskState<Awaited<ReturnType<Function>>> {
  (...args: Parameters<Function>): ReturnType<Function>;
}

const defaultOptions: ITaskOptions = {
  throw: false
}

const task = <Function extends AsyncFn>(
  fn: Function,
  options: ITaskOptions = defaultOptions
) => {

  const state: ITaskState<Awaited<ReturnType<Function>>> = observable({
    state: "initial",
    result: undefined,
    error: undefined,
    get initial() {
      return this.state === "initial"
    },
    get pending() {
      return this.state === "pending"
    },
    get resolved() {
      return this.state === "resolved"
    },
    get rejected() {
      return this.state === "rejected"
    }
  });

  const wrapper = async (...args: Parameters<Function>) => {
    try {

      runInAction(() => {
        state.state = "pending";
        state.result = undefined;
        state.error = undefined;
      });

      const result = await fn(...args);

      runInAction(() => {
        state.state = "resolved";
        state.result = result;
      });

      return state.result;

    } catch (error: any) {
      runInAction(() => {
        state.state = "rejected";
        state.result = undefined;
        state.error = error;
      });

      if (options.throw) {
        throw error;
      }
    }
  }

  Object.defineProperty(wrapper, "state", { get: () => state.state });
  Object.defineProperty(wrapper, "result", { get: () => state.result });
  Object.defineProperty(wrapper, "error", { get: () => state.error });
  Object.defineProperty(wrapper, "initial", { get: () => state.initial });
  Object.defineProperty(wrapper, "pending", { get: () => state.pending });
  Object.defineProperty(wrapper, "resolved", { get: () => state.resolved });
  Object.defineProperty(wrapper, "rejected", { get: () => state.rejected });

  return wrapper as ITask<Function>;
}

export default task;
