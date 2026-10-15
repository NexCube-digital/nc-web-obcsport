import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ScrollRevealProps {
	children: ReactNode
	className?: string
	delay?: number
}

function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
	const sectionRef = useRef<HTMLDivElement>(null)
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		const section = sectionRef.current
		if (!section) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return
				setIsVisible(true)
				observer.disconnect()
			},
			{ threshold: 0.08, rootMargin: '0px 0px -40px' },
		)

		observer.observe(section)
		return () => observer.disconnect()
	}, [])

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
