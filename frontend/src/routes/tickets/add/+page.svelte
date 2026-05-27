<script lang="ts">
	import { enhance } from '$app/forms';
	import Alert from '$lib/components/alert.svelte';
	import type { ActionData, PageServerData } from './$types';

	export let data: PageServerData;
	export let form: ActionData;

	const { teams } = data;
</script>

<h1 class="text-2xl font-bold">Add a ticket</h1>

<section class="pt-8">
	{#if form && form.errors}
		{#each form.errors as error}
			<Alert text={error.message} />
		{/each}
	{/if}
	<form
		method="POST"
		use:enhance={({ formData }) => {
			formData.append('user_id', '1');
		}}
	>
		<label class="form-control w-full max-w-xs">
			<div class="label">
				<span class="label-text">Title</span>
			</div>
			<input name="title" type="text" class="input input-bordered w-full max-w-xs" required />
		</label>
		<label class="form-control w-full max-w-xs pt-4">
			<div class="label">
				<span class="label-text">Description</span>
			</div>
			<textarea name="description" class="textarea textarea-bordered" required></textarea>
		</label>
		<label class="form-control w-full max-w-xs pt-4">
			<div class="label">
				<span class="label-text">Team</span>
			</div>
			<select name="team_id" class="select select-bordered w-full max-w-xs" required>
				<option value="" disabled selected>Select a team</option>
				{#each teams as team}
					<option value={team.id}>{team.name}</option>
				{/each}
			</select>
		</label>
		<label class="form-control w-full max-w-xs pt-4">
			<div class="label">
				<span class="label-text">Priority</span>
			</div>
			<select name="priority" class="select select-bordered w-full max-w-xs" required>
				<option value="" disabled selected>Select a priority</option>
				<option value={1}>Urgent</option>
				<option value={2}>Not urgent</option>
			</select>
		</label>
		<label class="form-control w-full max-w-xs pt-4">
			<button class="btn btn-primary">Add</button>
		</label>
	</form>
</section>
