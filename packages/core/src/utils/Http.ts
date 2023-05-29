export class HttpUtil {
  private _taskCount = 0
  private _taskQueue = []

  public limit = (simult: number) => async <T>(caller: (...args: any[]) => Promise<T>) => new Promise<T>((resolve, reject) => {
    const _t = this.__createTask(caller, resolve, reject)
    if (this._taskCount >= simult) this._taskQueue.push(_t)
    else _t()
  })

  private __createTask = <T>(caller: (...args: any[]) => Promise<T>, resolve: (value: any | PromiseLike<any>) => void, reject: (reason?: any) => void) => () => {
    caller()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this._taskCount--
        const _t = this._taskQueue.shift()
        _t()
      })
    this._taskCount++
  }
}