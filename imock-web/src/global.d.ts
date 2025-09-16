 
 
declare global {
    interface ObjectAny {
      [key: string]: any;
    }
  }
  
export {}
  
  // images
  declare module '*.jpg' {
    const src: string
    export default src
  }
  
  declare module '*.jpeg' {
    const src: string
    export default src
  }
  
  declare module '*.gif' {
    const src: string
    export default src
  }
  