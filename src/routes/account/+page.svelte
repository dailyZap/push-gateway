<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<h1>Welcome, {data.user.name}!</h1>

<a href="/account/servers">Servers & API Keys</a>
<a href="/account/stats">Stats</a>
