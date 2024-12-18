import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdmin {
  protected db;
  protected readonly firebase_params;
  private actionCodeSettings;

  constructor(private readonly configService: ConfigService) {
    const formatPrivateKey = (key: string): string => {
      if (typeof key !== 'string') {
        key = JSON.stringify(key)
  ;
      }
      return key.replace(/\\n/g, '\n'); // Replace escaped newlines
    };
    console.log("KEY", this.configService.get('firebase.private_key'))
    this.firebase_params = {
      type: this.configService.get('firebase.type'),
      projectId: this.configService.get('firebase.project_id'),
      privateKeyId: this.configService.get('firebase.private_key_id'),
      privateKey: formatPrivateKey(this.configService.get('firebase.private_key')),
      clientEmail: this.configService.get('firebase.client_email'),
      clientId: this.configService.get('firebase.client_id'),
      authUri: this.configService.get('firebase.auth_uri'),
      tokenUri: this.configService.get('firebase.token_uri'),
      authProviderX509CertUrl: this.configService.get(
        'firebase.auth_provider_x509_cert_url',
      ),
      clientC509CertUrl: this.configService.get(
        'firebase.client_x509_cert_url',
      ),
      project_id: this.configService.get('firebase.project_id'),
      client_email: this.configService.get('firebase.client_email'),
      client_id: this.configService.get('firebase.client_id'),
      private_key_id: this.configService.get('firebase.private_key_id'),
      private_key: formatPrivateKey(this.configService.get('firebase.private_key'))
    };

    this.actionCodeSettings = {
      // this URL must be whitelisted in the Firebase Console.
      url: this.configService.get('app.web_app_url'),
      handleCodeInApp: false,
    };
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(this.firebase_params),
      });
    } else {
      admin.app(); // if already initialized, use that one
    }
    this.db = admin.firestore();
  }

  async validateToken(idToken: string) {
    try {
      return await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return false;
    }
  }
}
