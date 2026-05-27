<script lang="ts">
	import Alert from '$lib/components/alert.svelte';
	import type { PageData } from './$types';
	import Icon from '@iconify/svelte';
	import dayjs from 'dayjs';

	export let data: PageData;
	const { tickets } = data;


	type Ticket = typeof tickets[number];
	let indexById = new Map<number, number>();
	let ordered: Ticket[] = [];


	$: {
		let next = indexById.size;
		for (const t of tickets ?? []) {
			if (!indexById.has(t.id)) indexById.set(t.id, next++);
		}
		ordered = [...(tickets ?? [])].sort(
				(a, b) => (indexById.get(a.id)! - indexById.get(b.id)!)
		);
	}

</script>

<section class="container mx-auto">
	<div class="flex justify-between">
		<h1 class="text-2xl font-bold">Tickets</h1>
		<a href="/tickets/add">
			<span class="text-2xl">
				<Icon icon="simple-line-icons:plus" />
			</span>
		</a>
	</div>

	<div class="grid grid-cols-3 gap-4 py-8 tickets">
		{#if !ordered}
			<Alert text="Missing tickets!" />
		{:else if !ordered.length}
			<p>No tickets yet</p>
		{:else}
			{#each ordered as ticket (ticket.id)}
				{#if ticket.status === undefined}
					<Alert text="Missing status!" />
				{:else}
					<a href={`/tickets/${ticket.id}`}>
						<div class={`card ${ticket.status !== 2 ? '' : 'solved'} bg-primary text-primary-content relative min-h-[180px]`}>
							<div class="absolute top-4 right-4">
								{#if ticket.priority === undefined}
									<Alert text="Missing priority!" />
								{:else if ticket.priority === 2}
									<div class="badge badge-error badge-lg">
										<Icon icon="simple-line-icons:fire" />
										&nbsp;urgent
									</div>
								{:else if ticket.priority === 1}
									<div class="badge badge-accent badge-lg">
										<Icon icon="simple-line-icons:bulb" />
										&nbsp;normal
									</div>
								{:else}
									<div class="badge badge-info badge-lg">
										<Icon icon="simple-line-icons:cup" />
										&nbsp;not urgent
									</div>
								{/if}
							</div>
							<div class="card-body">
								<div class="badges">
									{#if !ticket.created_at}
										<Alert text="Missing created_at!" />
									{:else}
										<div class="badge badge-default badge-outline">
											{dayjs(ticket.created_at).format('DD/MM/YYYY')}
										</div>
									{/if}
									{#if !ticket.team || !ticket.team.name}
										<Alert text="Missing team name!" />
									{:else}
										<div class="badge badge-accent">
											{ticket.team.name}
										</div>
									{/if}
								</div>
								{#if !ticket.title}
									<Alert text="Missing title!" />
								{:else}
									<h2 class="card-title">{ticket.title}</h2>
								{/if}

								{#if !ticket.description}
									<Alert text="Missing description!" />
								{:else}
									<p>{ticket.description}</p>
								{/if}
							</div>
						</div>
					</a>
				{/if}
			{/each}
		{/if}
	</div>
</section>