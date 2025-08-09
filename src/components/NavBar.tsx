import {Link, NavLink} from 'react-router'

export function NavBar() {
	function navLinkClass(isActive: boolean): string {
		const base = 'px-3 py-1.5 text-sm font-medium rounded-md'
		const active = 'bg-slate-900 text-white'
		const inactive = 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
		return `${base} ${isActive ? active : inactive}`
	}

	return (
		<header className='sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur'>
			<div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-3'>
				<Link
					className='flex items-center gap-2 text-lg font-semibold text-slate-900'
					to='/daily'
				>
					<img
						alt='Sorcerify'
						className='h-8 w-8'
						height='32'
						src='/logo-small.png'
						width='32'
					/>
					<span>Sorcerify</span>
				</Link>
				<nav className='flex items-center gap-2'>
					<NavLink
						className={({isActive}) => navLinkClass(isActive)}
						to='/daily'
					>
						Daily
					</NavLink>
					<NavLink
						className={({isActive}) => navLinkClass(isActive)}
						to='/practice'
					>
						Practice
					</NavLink>
				</nav>
			</div>
		</header>
	)
}
