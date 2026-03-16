import { useState } from 'react';

export default function Contact() {
	const [sent, setSent] = useState(false);

	const handleSubmit = (event) => {
		event.preventDefault();
		setSent(true);
	};

	return (
		<section className='card-grid'>
			<header className='card'>
				<h1>Contact GLH</h1>
				<p>Questions from customers, producers, and partners are welcome.</p>
			</header>

			<div className='split-layout'>
				<article className='card'>
					<h2>Support Details</h2>
					<p>Email: support@greenfieldlocalhub.co.uk</p>
					<p>Phone: +44 20 7946 0188</p>
					<p>Hours: Mon–Fri, 08:00–18:00</p>
					<p>Address: Greenfield Cooperative Centre, North Meadow Lane, London</p>
				</article>

				<form className='card card-grid' onSubmit={handleSubmit}>
					<h2>Send a Message</h2>
					<input className='input' type='text' placeholder='Your name' required />
					<input className='input' type='email' placeholder='Your email' required />
					<textarea className='textarea' rows='5' placeholder='How can we help?' required />
					<button className='btn' type='submit'>
						Send message
					</button>
					{sent && <p className='pill pill-green'>Message received. Our team will reply shortly.</p>}
				</form>
			</div>
		</section>
	);
}
