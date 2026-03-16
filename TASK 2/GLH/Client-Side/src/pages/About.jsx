export default function About() {
	return (
		<section className='card-grid'>
			<header className='card'>
				<h1>About Greenfield Local Hub</h1>
				<p>
					Greenfield Local Hub (GLH) is a cooperative platform connecting local farms with
					customers through transparent sourcing, fair pricing, and reliable collection or
					delivery.
				</p>
			</header>

			<div className='split-layout'>
				<article className='card'>
					<h2>Our Mission</h2>
					<p>
						Support resilient local food systems by helping producers reach nearby households
						without unnecessary middle layers.
					</p>
				</article>
				<article className='card'>
					<h2>How We Work</h2>
					<p>
						Customers browse seasonal products, place orders, and choose collection slots or
						delivery. Producers manage stock and availability in real time.
					</p>
				</article>
			</div>

			<article className='card'>
				<h2>Values</h2>
				<ul>
					<li>Fresh, traceable local produce.</li>
					<li>Fair opportunities for small and medium farms.</li>
					<li>Community-first fulfilment and service quality.</li>
					<li>Secure digital operations with maintainable systems.</li>
				</ul>
			</article>
		</section>
	);
}
