export const NOTIFICATION_PRIORITIES = {
	// Ensure that data-only notifications are also delivered when the app is closed.
	android: {
		priority: 'high'
	},
	apns: {
		payload: {
			aps: {
				contentAvailable: true
			}
		},
		headers: {
			'apns-push-type': 'background',
			'apns-priority': '5', // Must be `5` when `contentAvailable` is set to true.
			'apns-topic': 'io.flutter.plugins.firebase.messaging' // Required for background notifications on iOS.
		}
	}
} as const;
