<script lang="ts">
	import '../app.css';
	import Icon from '@iconify/svelte';
</script>

<header>
	<div class="navbar bg-base-200">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost text-xl">Tick & SAAS</a>
		</div>
		<div class="flex-none">
			<div class="dropdown dropdown-end">
				<div tabIndex={0} role="button" class="btn btn-ghost btn-circle avatar">
					<div class="w-10 rounded-full">
						<img
							alt="Tailwind CSS Navbar component"
							src="https://img.daisyui.com/images/daisyui/mark-compressed.svg"
						/>
					</div>
				</div>
				<ul
					tabIndex={0}
					class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52"
				>
					<li>
						<a href="/" class="justify-between">
							Profile
							<span class="badge">New</span>
						</a>
					</li>
					<li>
						<a href="/">Settings</a>
					</li>
					<li>
						<a href="/">Logout</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</header>

<main class="flex">
	<div class="w-2/12 min-h-screen">
		<aside class="h-full w-full">
			<nav class="h-full w-full">
				<ul class="menu bg-base-200 h-full w-full">
					<li>
						<a href="/tickets">
							<Icon icon="simple-line-icons:layers" />
							Tickets
						</a>
						<ul>
							<li><a href="/tickets/add">Add</a></li>
						</ul>
					</li>
				</ul>
			</nav>
		</aside>
	</div>
	<div class="flex-1 p-8">
		<slot />
	</div>
</main>
