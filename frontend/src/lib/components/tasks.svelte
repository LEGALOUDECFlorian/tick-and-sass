<script lang="ts">
	import Alert from './alert.svelte';
	import { enhance } from '$app/forms';
	import type { Task } from '../../app';

	export let tasks: Array<Task>;

	// --- ordre stable côté client ---
	let indexById = new Map<number, number>();
	let ordered: Array<Task> = [];

	// Conserver l’ordre initial (par 1re apparition) quel que soit le status
	$: {
		// Conserve les index existants, attribue un index aux nouveaux ids
		let next = indexById.size;
		for (const t of tasks) {
			if (!indexById.has(t.id)) indexById.set(t.id, next++);
		}
		// Affiche toujours trié par index d’origine
		ordered = [...tasks].sort((a, b) => (indexById.get(a.id)! - indexById.get(b.id)!));
	}

	const changeTaskStatus = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const form = target.closest('form');
		if (!form) return;
		form.requestSubmit();
	};

	console.log(tasks);
</script>

<div class="grid grid-cols-3 gap-4 pt-4 tasks">
	{#each ordered as task (task.id)}
		{#if task.status === undefined}
			<Alert text="Missing task status!" />
		{:else}
			<div class={`card ${task.status === 2 ? 'solved' : ''} bg-neutral-content text-primary-content`}>
				<div class="card-body">
					{#if !task.title}
						<Alert text="Missing task title!" />
					{:else}
						<h2 class="card-title">{task.title}</h2>
					{/if}
					{#if !task.description}
						<Alert text="Missing task description!" />
					{:else}
						<p>{task.description}</p>
					{/if}
				</div>

				<div class="flex justify-end gap-8 bg-neutral-content z-30">
					<div>
						<form
								method="POST"
								action="?/task_status"
								use:enhance={({ formData }) => {
								formData.append('id', `${task.id}`);
								let status = 1;
								if (task.status === 1) status = 0;
								formData.append('status', `${status}`);
							}}
						>
							<div class="form-control">
								<label class="label cursor-pointer flex gap-4 justify-end">
									<span class="label-text text-xs text-primary">In progress</span>
									<input
											type="checkbox"
											class="checkbox checkbox-primary"
											checked={task.status > 0 ? true : false}
											on:change={changeTaskStatus}
									/>
								</label>
							</div>
						</form>
					</div>
					<div>
						<form
								method="POST"
								action="?/task_status"
								use:enhance={({ formData }) => {
								formData.append('id', `${task.id}`);
								let status = 2;
								if (task.status === 2) status = 1;
								formData.append('status', `${status}`);
							}}
						>
							<div class="form-control">
								<label class="label cursor-pointer flex gap-4 justify-end">
									<span class="label-text text-xs text-primary">Solved</span>
									<input
											type="checkbox"
											class="checkbox checkbox-primary"
											checked={task.status > 1 ? true : false}
											on:change={changeTaskStatus}
									/>
								</label>
							</div>
						</form>
					</div>
				</div>
			</div>
		{/if}
	{/each}
</div>