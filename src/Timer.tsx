import { clearInterval, setInterval } from 'timers'

/** A speed-configurable and pausable timer */
export default class Timer {
  private period: number
  private callback: () => void
  private interval: NodeJS.Timeout
  private running: boolean = false
  private shouldReschedule: boolean = false

  constructor(initialSpeed: number, callback: () => void) {
    this.callback = callback
    this.setSpeed(initialSpeed)
  }

  public isPaused() {
    return !this.running
  }

  public play() {
    if (!this.running) {
      this.reschedule()
    }
  }

  public pause() {
    this.running = false
    clearInterval(this.interval)
  }

  public setSpeed(speed: number) {
    this.period = 10 + 4 * (100 - speed)
    this.shouldReschedule = true
  }

  private reschedule() {
    this.running = true
    clearInterval(this.interval)
    this.interval = setInterval(this.handler, this.period)
  }

  private handler = () => {
    this.callback()
    if (this.shouldReschedule) {
      this.reschedule()
    }
  }
}
