<script lang="ts">
	import { enhance } from '$app/forms';
	import Title from '$lib/components/Title.svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<Title title="Register" />

<h1 class="text-3xl font-bold self-center">Register</h1>

<span class="self-center"> Create your free account </span>
<span class="self-center">
	Rather login? - <a class="link link-secondary" href="/auth/login">Go back</a>
</span>
<form use:enhance method="post" action="?/register" class="contents">
	{#if form?.message}
		<div class="alert alert-error">
			{form.message}
		</div>
	{/if}

	<label class="form-control">
		<div class="label">
			<span class="label-text">Server-Domain</span>
		</div>
		<input
			class="input input-bordered"
			type="text"
			placeholder="social.example.com"
			name="server"
		/>
		<small class="ms-3">(without protocol or path)</small>
	</label>

	<label class="form-control">
		<div class="label">
			<span class="label-text">Full Name</span>
		</div>
		<input class="input input-bordered" type="text" placeholder="John Doe" name="name" />
	</label>

	<label class="form-control">
		<div class="label">
			<span class="label-text">Email</span>
		</div>
		<input class="input input-bordered" type="email" placeholder="jon@example.com" name="email" />
	</label>

	<label class="form-control">
		<div class="label">
			<span class="label-text">Password</span>
		</div>

		<input type="password" class="input input-bordered" name="password" />
	</label>

	<label class="form-control">
		<div class="label">
			<span class="label-text">Confirm Password</span>
		</div>

		<input type="password" class="input input-bordered" name="passwordConfirmation" />
	</label>

	<div class="form-control">
		<label class="cursor-pointer label self-start gap-2">
			<input type="checkbox" class="checkbox" />
			<span class="label-text">
				I agree to the <a class="link link-accent" href="/legal/terms">terms and conditions</a>.
			</span>
		</label>
	</div>

	<button class="btn btn-primary">
		Register
		<i class="fas fa-user-plus"></i>
	</button>
</form>
