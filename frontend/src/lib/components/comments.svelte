<script lang="ts">
	import Alert from './alert.svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import type { Comment } from '../../app';
	dayjs.extend(relativeTime);

	export let comments: Array<Comment>;
</script>

{#each comments as comment}
	<div class="chat chat-start">
		{#if !comment.user || !comment.user.name}
			<Alert text="Missing comments username!" />
		{:else}
			<div class="chat-header">
				{comment.user.name}
				{#if !comment.content}
					<Alert text="Missing comments content!" />
				{:else}
					<time class="text-xs opacity-50">{dayjs(comment.created_at).fromNow()}</time>
				{/if}
			</div>
		{/if}
		<div class="chat-bubble">{comment.content}</div>
	</div>
{/each}
