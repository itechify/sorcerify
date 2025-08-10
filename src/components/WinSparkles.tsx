import {type ReactElement, useEffect, useMemo, useRef, useState} from 'react'

interface Properties {
	active: boolean
}

// Lightweight sparkle/confetti burst centered in parent. Relies on styles in global.css
export function WinSparkles({active}: Properties) {
	const [burstId, setBurstId] = useState(0)
	const timeoutRef = useRef<number | null>(null)

	// When active toggles true, trigger a new burst and schedule cleanup
	useEffect(() => {
		if (!active) return
		setBurstId(prev => prev + 1)
		if (timeoutRef.current != null) {
			window.clearTimeout(timeoutRef.current)
		}
		// total animation budget roughly 1.2s
		timeoutRef.current = window.setTimeout(() => {
			timeoutRef.current = null
		}, 1300)
		return () => {
			if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current)
		}
	}, [active])

	const particles = useMemo(() => {
		// fixed, small number of elements for performance
		const nodes: ReactElement[] = []
		const random = (seed: number) => {
			// simple deterministic-ish generator from burstId so SSR/CSR stable enough
			const x = Math.sin(seed) * 10_000
			return x - Math.floor(x)
		}

		const total = 16
		for (let i = 0; i < total; i++) {
			const seed = burstId * 97 + i * 13
			const angle = (i / total) * Math.PI * 2
			const distance = 80 + random(seed) * 70 // px
			const tx = Math.cos(angle) * distance
			const ty = Math.sin(angle) * distance
			const hue = Math.floor(20 + random(seed + 1) * 320)
			const delay = Math.floor(random(seed + 2) * 180)
			const rotate = Math.floor(random(seed + 3) * 360)
			const style = {
				// custom properties for CSS keyframes
				['--tx' as const]: `${tx}px`,
				['--ty' as const]: `${ty}px`,
				['--h' as const]: `${hue}`,
				['--d' as const]: `${delay}ms`,
				['--r' as const]: `${rotate}deg`
			} as React.CSSProperties
			nodes.push(
				<span
					className='celebrate-sparkle'
					key={`spark-${burstId}-${i}`}
					style={style}
				/>
			)
			// add a confetti bar for every other particle
			if (i % 2 === 0) {
				const cstyle = {
					['--tx' as const]: `${tx * 0.8}px`,
					['--ty' as const]: `${ty * 0.6}px`,
					['--h' as const]: `${(hue + 60) % 360}`,
					['--d' as const]: `${delay + 40}ms`,
					['--r' as const]: `${rotate}deg`
				} as React.CSSProperties
				nodes.push(
					<span
						className='celebrate-confetti'
						key={`conf-${burstId}-${i}`}
						style={cstyle}
					/>
				)
			}
		}
		// ring highlight
		nodes.push(<span className='celebrate-ring' key={`ring-${burstId}`} />)
		return nodes
	}, [burstId])

	if (!active) return null
	return <div className='celebrate-overlay'>{particles}</div>
}
