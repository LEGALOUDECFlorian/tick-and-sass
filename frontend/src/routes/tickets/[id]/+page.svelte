<script lang="ts">
	import Alert from '$lib/components/alert.svelte';
	import Comments from '$lib/components/comments.svelte';
	import Tasks from '$lib/components/tasks.svelte';
	import Icon from '@iconify/svelte';
	import type { ActionData, PageServerData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageServerData;
	export let form: ActionData;

	$: ticket = data.ticket;
</script>

{#if form && form.errors}
	{#each form.errors as error}
		<Alert text={error.message} />
	{/each}
{/if}

<div class="actions flex justify-end">
	<div class="flex gap-4 bg-primary p-4 rounded-tl-lg rounded-tr-lg">
		<form
			method="POST"
			action="?/status"
			use:enhance={({ formData }) => {
				formData.append('ticket_id', `${ticket.id}`);
				formData.append('status', `${ticket.status}`);
			}}
		>
			{#if ticket.status !== 2}
				<div class="tooltip" data-tip="Mark as solved">
					<button class="btn btn-circle btn-success">
						<Icon icon="simple-line-icons:check" />
					</button>
				</div>
			{:else}
				<div class="tooltip" data-tip="Mark as unsolved">
					<button class="btn btn-circle btn-success">
						<Icon icon="simple-line-icons:action-undo" />
					</button>
				</div>
			{/if}
		</form>
		<div class="tooltip" data-tip="Edit ticket">
			<a href={`/tickets/${ticket.id}/edit`} class="btn btn-circle btn-info">
				<Icon icon="simple-line-icons:pencil" />
			</a>
		</div>
		<form
			method="POST"
			action="?/delete"
			use:enhance={({ formData }) => {
				formData.append('ticket_id', `${ticket.id}`);
			}}
		>
			<div class="tooltip" data-tip="Delete ticket">
				<button class="btn btn-circle btn-error">
					<Icon icon="simple-line-icons:trash" />
				</button>
			</div>
		</form>
	</div>
</div>
<div class="card w-full bg-primary text-primary-content rounded-tr-none">
	<div class="card-body gap-4">
		<div>
			<div class="badge badge-outline">Ticket ID</div>
			<div class="pl-8">
				{#if !ticket.id}
					<Alert text="Missing id!" />
				{:else}
					<span class="font-bold">{ticket.id}</span>
				{/if}
			</div>
		</div>
		<div>
			<div class="badge badge-outline">Title</div>
			<div class="pl-8">
				{#if !ticket.title}
					<Alert text="Missing title!" />
				{:else}
					<h2 class="card-title">{ticket.title}</h2>
				{/if}
			</div>
		</div>
		<div>
			<div class="badge badge-outline">Description</div>
			<div class="pl-8">
				{#if !ticket.description}
					<Alert text="Missing description!" />
				{:else}
					<p class="font-bold">{ticket.description}</p>
				{/if}
			</div>
		</div>
		<div>
			<div class="badge badge-outline">Tasks</div>
			<div class="pl-8">
				{#if !ticket.tasks}
					<Alert text="Missing tasks!" />
				{:else if !ticket.tasks.length}
					<p>No tasks yet</p>
				{:else}
					<Tasks tasks={ticket.tasks} />
				{/if}
			</div>
		</div>
		<div>
			<div class="badge badge-outline">Opened by</div>
			<div class="pl-8">
				{#if !ticket.user || !ticket.user.name}
					<Alert text="Missing user name!" />
				{:else}
					<p class="font-bold">{ticket.user.name}</p>
				{/if}
			</div>
		</div>
		<div>
			<div class="badge badge-outline">Comments</div>
			{#if !ticket.comments}
				<Alert text="Missing comments!" />
			{:else}
				<div class="pl-8">
					<Comments comments={ticket.comments} />
				</div>
			{/if}
		</div>
	</div>
</div>
