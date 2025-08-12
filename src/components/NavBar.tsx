import {useEffect, useState} from 'react'
import {Link, NavLink} from 'react-router'
import {buttonVariants} from '@/components/ui/button'

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

	return (
		<header className='fixed top-0 left-0 right-0 z-30 backdrop-blur w-full'>
			<div className='flex items-center justify-between px-4 py-3 w-full'>
				<Link
					className='flex items-center gap-2 text-lg font-semibold text-white'
					to='/daily'
				>
					<img
						alt='Sorcerify'
						className='h-8 w-8'
						height='32'
						src='/logo-small.png'
						width='32'
					/>
					<span className='hidden sm:inline'>Sorcerify</span>
				</Link>
				<nav className='flex items-center gap-1 sm:gap-2'>
					<NavLink
						className={({isActive}) =>
							buttonVariants({
								variant: isActive ? 'default' : 'ghost',
								size: 'sm'
							})
						}
						to='/daily'
					>
						Daily
					</NavLink>
					<NavLink
						className={({isActive}) =>
							buttonVariants({
								variant: isActive ? 'default' : 'ghost',
								size: 'sm'
							})
						}
						to='/practice'
					>
						Practice
					</NavLink>
					<span className='ml-1 sm:ml-2 rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white'>
						<span className='hidden sm:inline'>Daily Streak: </span>
						<span className='sm:hidden'>Streak: </span>
						<span className='tabular-nums'>{streak}</span>
					</span>
				</nav>
			</div>
		</header>
	)
}
