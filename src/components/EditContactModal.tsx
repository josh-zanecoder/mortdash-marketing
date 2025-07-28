import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useContactStore } from '@/store/useContactStore';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

function formatUSPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export default function EditContactModal({ open, onClose, onSubmit, channels, contact }: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (form: any) => void;
  channels: { value: string; label: string }[];
  contact: any;
}) {
  const [form, setForm] = useState({
    channel: '',
    company: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const updateContact = useContactStore((s) => s.updateContact);

  useEffect(() => {
    if (contact) {
      setForm({
        channel: channels.find(c => c.label === contact.branch)?.value || channels[0]?.value || '',
        company: contact.company || '',
        firstName: contact.first_name || '',
        lastName: contact.last_name || '',
        email: contact.email_address || contact.email || '',
        phone: contact.phone_number || contact.phone || '',
        title: contact.title || '',
      });
    }
  }, [contact, channels]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === 'phone') {
      setForm({ ...form, phone: formatUSPhoneNumber(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const selectedChannel = channels.find(c => c.value === form.channel) || channels[0];
    const payload = {
      id: contact.id,
      branch: selectedChannel.label,
      company: form.company,
      first_name: form.firstName,
      last_name: form.lastName,
      email_address: form.email,
      title: form.title,
      phone_number: form.phone,
    };
    const success = await updateContact(payload);
    setSubmitting(false);
    if (success) {
      onClose();
      toast.success('Contact updated successfully!', {
        icon: <CheckCircle2 className="text-green-600" />,
      });
      if (onSubmit) onSubmit(form);
    } else {
      toast.error('Failed to update contact.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md w-full p-0 rounded-2xl">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold">Edit Marketing Contact</DialogTitle>
          <DialogClose className="cursor-pointer" />
        </DialogHeader>
        <form className="flex flex-col gap-4 px-6 pb-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="channel" className="block text-sm font-medium mb-1">Select Channel</Label>
            <select
              id="channel"
              name="channel"
              value={form.channel}
              onChange={handleChange}
              className="cursor-pointer w-full border rounded-md px-4 py-3 text-base bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6600]/30"
              required
            >
              {channels.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="company" className="block text-sm font-medium mb-1">Company Name</Label>
            <Input
              id="company"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Enter Company Name"
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Enter First Name"
                required
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Enter Last Name"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</Label>
            <Input
              id="email"
              name="email"
              value={form.email}
              disabled
              placeholder="Email cannot be changed"
              type="email"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="(XXX) XXX-XXXX"
              type="tel"
              maxLength={14}
            />
          </div>
          <div>
            <Label htmlFor="title" className="block text-sm font-medium mb-1">Title</Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter Title"
              required
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              className="cursor-pointer w-1/2 bg-white text-[#ff6600] border border-[#ff6600] hover:bg-[#fff7ed] font-bold py-3 rounded-lg shadow transition-all text-lg"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer w-1/2 bg-[#ff6600] hover:bg-[#ff7a2f] text-white font-bold py-3 rounded-lg shadow transition-all text-lg"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
