<script lang="ts">
	import { enhance } from '$app/forms';
	import Title from '$lib/components/Title.svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<Title title="Log in" />

<h1 class="text-3xl font-bold self-center">Log in</h1>

<span class="self-center">
	Don't have an account?
	<a class="link link-secondary" href="/auth/register">Register</a>
</span>

<form use:enhance method="post" action="?/login" class="contents">
	{#if form?.message}
		<div class="alert alert-error">
			{form.message}
		</div>
	{/if}

	<label class="form-control">
		<div class="label">
			<span class="label-text">Email</span>
		</div>

		<input
			class="input input-bordered"
			type="email"
			name="email"
			placeholder="johndoe@example.com"
		/>
	</label>

	<label class="form-control">
		<div class="label">
			<span class="label-text">Password</span>
			<a class="label-text link link-accent" href="/auth/password-reset">Forgot password?</a>
		</div>

		<input type="password" class="input input-bordered" name="password" />
	</label>

	<button class="btn btn-primary">
		Log in
		<i class="fas fa-sign-in-alt"></i>
	</button>
</form>
