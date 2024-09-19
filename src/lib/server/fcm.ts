import { initializeApp, type App } from 'firebase-admin/app';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';
import admin from 'firebase-admin';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

const googleServicesAccountJson = building
	? (null as any)
	: JSON.parse(Buffer.from(env.GOOGLE_SERVICES_ACCOUNT_JSON!, 'base64').toString('utf-8'));

export const fcm = building
	? (null as any as App)
	: initializeApp({
			credential: admin.credential.cert(googleServicesAccountJson)
		});

export const messaging = building ? (null as any as Messaging) : getMessaging(fcm);
