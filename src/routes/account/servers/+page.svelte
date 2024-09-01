<script lang="ts">
	import { enhance } from '$app/forms';
	import Date from '$lib/components/Date.svelte';
	import { MAX_SERVERS } from '$lib/config/config';
	import type { PageData } from './$types';

	export let data: PageData;
	let creatingNewServer = false;
</script>

<div class="overflow-x-auto">
	<h3 class="text-lg font-bold">
		My Servers
		<span class="badge badge-primary">{data.servers.length} / {MAX_SERVERS}</span>
	</h3>
	<table class="table">
		<thead>
			<tr>
				<th>
					<label>
						<input type="checkbox" class="checkbox" />
					</label>
				</th>
				<th>Domain</th>
				<th>API Key</th>
			</tr>
		</thead>
		<tbody>
			{#each data.servers as server (server.id)}
				<tr>
					<th>
						<label>
							<input type="checkbox" class="checkbox" />
						</label>
					</th>
					<td>
						<code class="code">{server.domain}</code>
					</td>
					<td>
						<table class="table">
							<tbody>
								{#each server.apiKeys as apiKey}
									<tr>
										<td>
											{#if apiKey.active}
												<div class="badge badge-success">{apiKey.shortenedKey}...</div>
											{:else}
												<div class="badge badge-warning">{apiKey.shortenedKey}...</div>
											{/if}
											<button
												class="btn btn-outline btn-sm btn-primary"
												on:click={() => {
													navigator.clipboard.writeText(apiKey.key);
												}}
											>
												<i class="fa fa-copy"></i>
											</button>
										</td>
										<td>
											Created: <Date date={apiKey.createdAt} />
										</td>
										<td>
											{#if apiKey.lastUsed}
												Last used: <Date date={apiKey.lastUsed} />
											{:else}
												Never used
											{/if}
										</td>
										<td>
											{#if apiKey.active}
												<form action="?/deactivateApiKey" method="post" use:enhance>
													<input type="hidden" name="serverId" value={server.id} />
													<input type="hidden" name="apiKeyId" value={apiKey.id} />
													<button type="submit" class="btn btn-sm btn-error">Deactivate</button>
												</form>
											{/if}
										</td>
									</tr>
								{/each}
								<tr>
									<td>
										<form action="?/createApiKey" method="post" use:enhance>
											<input type="hidden" name="serverId" value={server.id} />
											<button type="submit" class="btn btn-sm btn-primary">Create API Key</button>
										</form>
									</td>
									<td></td>
								</tr>
							</tbody>
						</table>
					</td>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			{#if !creatingNewServer}
				<tr>
					<td></td>
					<td>
						<button
							class="btn btn-primary"
							on:click={() => {
								creatingNewServer = true;
							}}
						>
							New Server
						</button>
					</td>
					<td></td>
				</tr>
			{:else}
				<tr>
					<td></td>
					<td>
						<input
							type="text"
							class="input"
							placeholder="Domain"
							form="createServerForm"
							name="domain"
						/>
					</td>
					<td>
						<form action="?/createServer" method="post" use:enhance id="createServerForm">
							<button type="submit" class="btn btn-primary">Create Server</button>
						</form>
					</td>
				</tr>
			{/if}
		</tfoot>
	</table>
</div>
