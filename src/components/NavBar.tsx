import {useEffect, useState} from 'react'
import {Link, NavLink} from 'react-router'

export function NavBar() {
	const [streak, setStreak] = useState<number>(() => {
		try {
			const raw = localStorage.getItem('sorcerify:streak')
			return raw ? Number(raw) || 0 : 0
		} catch {
			return 0
		}
	})

	useEffect(() => {
		function onCustomUpdate(e: Event) {
			const detail = (e as CustomEvent).detail as {streak?: number} | undefined
			if (detail && typeof detail.streak === 'number') {
				setStreak(detail.streak)
			} else {
				// fallback read
				try {
					const raw = localStorage.getItem('sorcerify:streak')
					setStreak(raw ? Number(raw) || 0 : 0)
				} catch {
					setStreak(0)
				}
			}
		}
		function onStorage() {
			try {
				const raw = localStorage.getItem('sorcerify:streak')
				setStreak(raw ? Number(raw) || 0 : 0)
			} catch {
				setStreak(0)
			}
		}
		window.addEventListener(
			'sorcerify:streak-updated',
			onCustomUpdate as EventListener
		)
		window.addEventListener('storage', onStorage)
		return () => {
			window.removeEventListener(
				'sorcerify:streak-updated',
				onCustomUpdate as EventListener
			)
			window.removeEventListener('storage', onStorage)
		}
	}, [])

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
					<span className='ml-2 rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white'>
						Daily Streak: <span className='tabular-nums'>{streak}</span>
					</span>
				</nav>
			</div>
		</header>
	)
}
