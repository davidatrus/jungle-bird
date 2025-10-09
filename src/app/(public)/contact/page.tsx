'use client';

import { FormEvent, useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const to = 'hello@junglebird.example';
    const subject = encodeURIComponent(
      `Website Message from ${name || 'Guest'}`,
    );
    const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${msg}`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-10">
      <header className="text-center">
        <h1 className="font-display text-3xl md:text-4xl">CONTACT US</h1>
        <p className="mt-2 opacity-80">
          Reach out for reservations, events, or press.
        </p>
      </header>

      {/* Contact details */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-lg">ADDRESS</h2>
            <p className="opacity-80">123 Example St SW, Calgary AB</p>
          </div>
          <div>
            <h2 className="font-display text-lg">PHONE</h2>
            <p>
              <a className="underline hover:opacity-90" href="tel:+18250000000">
                (825) 000 0000
              </a>
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg">EMAIL</h2>
            <p>
              <a
                className="underline hover:opacity-90"
                href="mailto:hello@junglebird.example"
              >
                hello@junglebird.example
              </a>
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg">HOURS</h2>
            <p className="opacity-80">
              Sun–Thu: 5:00pm–1:00am
              <br />
              Fri–Sat: 5:00pm–2:00am
              <br />
              Mon: Closed
            </p>
          </div>
        </div>

        {/* Mailto form */}
        <form
          onSubmit={onSubmit}
          className="brass-border space-y-3 rounded-2xl border p-4 md:p-6"
        >
          <div>
            <label className="mb-1 block text-sm opacity-80">Your name</label>
            <input
              className="brass-border w-full rounded-md border bg-transparent px-3 py-2"
              style={{ color: 'var(--text)' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm opacity-80">Your email</label>
            <input
              className="brass-border w-full rounded-md border bg-transparent px-3 py-2"
              style={{ color: 'var(--text)' }}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm opacity-80">Message</label>
            <textarea
              className="brass-border min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2"
              style={{ color: 'var(--text)' }}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Tell us about your event or request…"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-pop btn-shadow brass-border rounded-full px-5 py-3 text-sm font-medium"
            style={{ background: 'var(--cta)', color: '#1B1612' }}
          >
            Email Us
          </button>
        </form>
      </section>

      {/* FAQ */}
      <section className="pt-2">
        <h2 className="font-display mb-4 text-2xl">FAQ</h2>
        <div className="space-y-3">
          <details className="brass-border rounded-lg border p-4">
            <summary className="font-ui cursor-pointer tracking-[0.08em] uppercase">
              Do you take large party bookings?
            </summary>
            <p className="mt-2 opacity-80">
              Yes—email us with your date, time, and party size and we’ll
              confirm availability.
            </p>
          </details>
          <details className="brass-border rounded-lg border p-4">
            <summary className="font-ui cursor-pointer tracking-[0.08em] uppercase">
              Is there a dress code?
            </summary>
            <p className="mt-2 opacity-80">
              Smart casual works great. No athletic wear after 8pm.
            </p>
          </details>
          <details className="brass-border rounded-lg border p-4">
            <summary className="font-ui cursor-pointer tracking-[0.08em] uppercase">
              Do you offer gift cards?
            </summary>
            <p className="mt-2 opacity-80">
              Yes—ask at the bar or email us and we’ll set you up digitally.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
