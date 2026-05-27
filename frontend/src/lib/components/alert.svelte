<script lang="ts">
	import Icon from '@iconify/svelte';
	export let text: string | undefined;
</script>

<div role="alert" class="alert alert-error m-4">
	<Icon icon="simple-line-icons:close" />
	<span>{text || 'Unknown error!'}</span>
</div>
