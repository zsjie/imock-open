/* eslint-disable @typescript-eslint/no-explicit-any */
export class Logger {
    logger: Console
  
    moduleName: string
  
    constructor(moduleName = '') {
        this.logger = console
        this.moduleName = moduleName
    }
  
     
    private getTimePrefix(): string {
        const now = new Date()
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')
        return `${hours}:${minutes}:${seconds}`
    }
  
    debug(message: any, ...optionalParams: any[]): void {
        this.logger.log(`[${this.moduleName} ${this.getTimePrefix()}]`, message, ...optionalParams)
    }
  
    log(message: any, ...optionalParams: any[]): void {
        this.logger.log(`[${this.moduleName} ${this.getTimePrefix()}]`, message, ...optionalParams)
    }
  
    info(message: any, ...optionalParams: any[]): void {
        this.logger.info(`[${this.moduleName} ${this.getTimePrefix()}]`, message, ...optionalParams)
    }
  
    warn(message: any, ...optionalParams: any[]): void {
        this.logger.warn(`[${this.moduleName} ${this.getTimePrefix()}]`, message, ...optionalParams)
    }
  
    error(message: any, ...optionalParams: any[]): void {
        this.logger.error(`[${this.moduleName} ${this.getTimePrefix()}]`, message, ...optionalParams)
    }
}
  
const logger = new Logger()
  
export default logger
  