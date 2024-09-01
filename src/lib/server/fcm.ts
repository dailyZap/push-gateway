import { initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import admin from 'firebase-admin';
import { env } from '$env/dynamic/private';

const googleServicesAccountJson = JSON.parse(
	Buffer.from(env.GOOGLE_SERVICES_ACCOUNT_JSON, 'base64').toString('utf-8')
);

export const fcm = initializeApp({
	credential: admin.credential.cert(googleServicesAccountJson)
});

export const messaging = getMessaging(fcm);
