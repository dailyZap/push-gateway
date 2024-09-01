<script lang="ts">
	import { MAX_SERVERS } from '$lib/config/config';
	import type { PageData } from './$types';
	export let data: PageData;

	const cards = [
		{
			title: 'Servers & API Keys',
			description: `You can have up to ${MAX_SERVERS} servers and unlimited API keys.`,
			image: '/assets/servers.svg',
			link: '/account/servers',
			button: 'Manage'
		},
		{
			title: 'Stats',
			description: 'View your stats and discover interesting insights.',
			image: '/assets/stats.svg',
			link: '/account/stats',
			button: 'View'
		}
	];
</script>

<h1 class="text-2xl font-bold mb-4">
	Welcome, {data.user.name}!
</h1>

<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
	{#each cards as card}
		<div class="card bg-base-100 shadow-xl bg-gray-900">
			<figure class="p-5">
				<img src={card.image} alt={card.title} />
			</figure>
			<div class="card-body">
				<h2 class="card-title">{card.title}</h2>
				<p>
					{card.description}
				</p>
				<div class="card-actions justify-end">
					<a class="btn btn-primary" href={card.link}>{card.button} </a>
				</div>
			</div>
		</div>
	{/each}
</div>
