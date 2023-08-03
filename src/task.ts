import { observable, runInAction } from "mobx";

interface ITaskOptions {
  throw: boolean;
}

type States = "initial" | "pending" | "resolved" | "rejected";

interface ITaskState<T> {
  state: States;
  result: T;
  error: any;
  initial: boolean;
  pending: boolean;
  resolved: boolean;
  rejected: boolean;
}

interface ITask<T> extends ITaskState<T> {
  (): Promise<T>;
}

const defaultOptions: ITaskOptions = {
  throw: false
}

const task = <T>(fn: () => Promise<T>, options: ITaskOptions = defaultOptions) => {

  const state: ITaskState<T> = observable({
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

  const wrapper = async () => {
    try {

      runInAction(() => {
        state.state = "pending";
        state.result = undefined;
        state.error = undefined;
      });

      const result = await fn();

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

  return wrapper as ITask<T>;
}

export default task;
