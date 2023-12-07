import dotenv from "dotenv";
dotenv.config({ path: "./.env.development" });

/**
 * @breif Configuration object to hold all environmental variables
 */

const config = {
  /**
   * @breif The basic API environment, port and prefix configuration values
   */
  env: process.env.NODE_ENV,
  port: process.env.PORT || 9000,
  prefix: process.env.API_PREFIX || "/api",
  cameroon_country_code: process.env.CAMEROON_COUNTRY_CODE,
  /**
   * @breif Database for various environments
   */
  db: {
    dev: process.env.DATABASE_DEV,
    test: process.env.DATABASE_TEST,
    prod: process.env.DATABASE_PROD,
    password: process.env.DATABASE_PASSWORD,
    user: process.env.DATABASE_USER,
  },
  /**
   * @breif JWT important variables
   * */
  jwt: {
    // The secret used to sign and validate signature
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    cookieExpires: process.env.JWT_COOKIE_EXPIRES_IN,
  },
  /**
   * @breif Twilio import variables
   */
  twilio: {
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM,
  },
  /**
   * @breif Setup remote url
   */
  url: {
    dev: process.env.REMOTE_URL_DEV,
    prod: process.env.REMOTE_URL_PROD,
  },
};

export default config;
