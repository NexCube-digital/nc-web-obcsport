import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ScrollRevealProps {
	children: ReactNode
	className?: string
	delay?: number
}

function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
	const sectionRef = useRef<HTMLDivElement>(null)
	const shouldSkipAnimation =
		typeof window !== 'undefined' &&
		(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
			!('IntersectionObserver' in window))
	const [isVisible, setIsVisible] = useState(shouldSkipAnimation)

	useEffect(() => {
		const section = sectionRef.current
		if (!section || shouldSkipAnimation) return

		let firstFrame = 0
		let secondFrame = 0

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return
				observer.disconnect()
				firstFrame = requestAnimationFrame(() => {
					secondFrame = requestAnimationFrame(() => setIsVisible(true))
				})
			},
			{ threshold: 0.08, rootMargin: '0px 0px -40px' },
		)

		observer.observe(section)
		return () => {
			cancelAnimationFrame(firstFrame)
			cancelAnimationFrame(secondFrame)
			observer.disconnect()
		}
	}, [shouldSkipAnimation])

	return (
		<div
			ref={sectionRef}
			className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
				isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
			} ${className}`}
			style={{ transitionDelay: isVisible ? `${delay}ms` : undefined }}
		>
			{children}
		</div>
	)
}

export default ScrollReveal
