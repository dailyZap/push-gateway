import { dev } from '$app/environment';
import { fail } from '@sveltejs/kit';

export async function validateServerDomain(domain: string) {
	// must be reachable via https
	// check /api/v1/info
	const url = `https://${domain}/api/v1/info`;
	const response = await fetch(url).catch(() => null);
	if (!dev && !response?.ok) {
		return fail(400, {
			message: 'Could not reach server at ' + url
		});
	}
	const serverInfo = (await response?.json()) || {};
	if (!dev && serverInfo.api !== 'socialnetwork') {
		return fail(400, {
			message: 'Invalid server. Are you sure this is a social network server?'
		});
	}
	return true;
}
