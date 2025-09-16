/* eslint-disable */
module.exports = {
    apps : [{
        name: 'imock-server',
        script: './dist/index.js',
        watch: false,
        env: {
            MYSQL_URL: process.env.MYSQL_URL_PROD ||process.env.MYSQL_URL,
            JWT_SECRET:  process.env.JWT_SECRET_PROD || process.env.JWT_SECRET,
            ALIBABA_CLOUD_ACCESS_KEY_ID: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
            ALIBABA_CLOUD_ACCESS_KEY_SECRET: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
            RUNTIME_ENV: process.env.RUNTIME_ENV,
            STATIC_DIR: process.env.STATIC_DIR,
            ORIGIN: process.env.ORIGIN,

            EMAIL_HOST: process.env.EMAIL_HOST,
            EMAIL_PORT: process.env.EMAIL_PORT,
            EMAIL_USER: process.env.EMAIL_USER,
            EMAIL_PASS: process.env.EMAIL_PASS,

            // AI Mock 功能
            QWEN_API_KEY: process.env.QWEN_API_KEY,

        }
    }],
}
