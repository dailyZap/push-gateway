<div class="navbar bg-base-100 container mx-auto">
	<div class="navbar-start">
		<div class="dropdown">
			<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16"
					/>
				</svg>
			</div>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
			>
				<li><a href="/account/servers">Servers & API Keys</a></li>
				<li><a href="/account/stats">Stats</a></li>
			</ul>
		</div>
		<a class="btn btn-ghost text-xl" href="/">Push Notification Gateway</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/account/servers">Servers & API Keys</a></li>
			<li><a href="/account/stats">Stats</a></li>
		</ul>
	</div>
	<div class="navbar-end">
		<a class="btn btn-ghost" href="/auth/logout">Log Out</a>
	</div>
</div>

<div class="container mx-auto p-6">
	<slot />
</div>
