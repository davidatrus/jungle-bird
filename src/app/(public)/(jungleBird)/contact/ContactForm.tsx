'use client';

import { FormEvent, useState } from 'react';

export default function ContactForm({ to }: { to: string }) {
  const [name, setName] = useState('');
  const [emailFrom, setEmailFrom] = useState('');
  const [msg, setMsg] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Website Message from ${name || 'Guest'}`,
    );
    const body = encodeURIComponent(
      `From: ${name}\nEmail: ${emailFrom}\n\n${msg}`,
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
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
          value={emailFrom}
          onChange={(e) => setEmailFrom(e.target.value)}
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
  );
}
