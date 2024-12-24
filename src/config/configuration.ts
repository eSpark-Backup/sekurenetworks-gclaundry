import { config } from 'dotenv';

config();

export enum APP_ENV {
  DEV = 'DEV',
  PROD = 'PROD',
}

export default () => ({
  app: {
    env: process.env.NODE_ENV ?? APP_ENV.PROD,
    port: parseInt(process.env.PORT) || 8000,
    web_app_url: process.env.WEB_APP_URL,
    cors: [
      'https://laundry-web-control-app.web.app/',
      'http://localhost:3000',
      'https://generation-conscious--wip-9q0oz6i3.web.app',
      'generation-conscious.web.app',
      'generation-conscious.firebaseapp.com',
    ],
  },
  auth: {
    SUPERUSER: 1,
    ADMIN: 2,
    ORG_ADMIN: 3,
    APP_USER: 4,
    PERMISSION_CHECKER_KEY: 'UserRolePermissions',
  },
  email: {
    from: process.env.EMAIL_FROM,
    template: {
      demo: process.env.SENDGRID_DEMO_TEMPLATE_ID,
    },
    sendgrid_api_key: process.env.SENDGRID_API_KEY,
  },
  sms: {
    twilio: {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
    },
    SMS_TO_LIST: ['+19059617321', '+16319745548', '+14052982929'],
  },
  firebase: {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.toString().replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  },
  geo: {
    building_radius: 500, // in meters
    business_radius: 2000, // in meters
  },
});
