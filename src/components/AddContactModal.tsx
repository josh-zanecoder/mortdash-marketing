import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useContactStore } from '@/store/useContactStore';

function formatUSPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  // Only allow up to 10 digits
  const limitedDigits = digits.slice(0, 10);
  if (limitedDigits.length <= 3) return limitedDigits;
  if (limitedDigits.length <= 6) return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
  return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6, 10)}`;
}

export default function AddContactModal({ open, onClose, onSubmit, channels }: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (form: any) => void;
  channels: { value: string; label: string }[];
}) {
  const [form, setForm] = useState({
    channel: channels[0]?.value || '',  // Initialize with first channel's value
    company: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);
  const addContact = useContactStore((s) => s.addContact);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate that fields are not empty or only spaces
    const newErrors: {[key: string]: string} = {};
    
    if (!form.company.trim()) {
      newErrors.company = 'Company Name cannot be empty or contain only spaces';
    }
    if (!form.firstName.trim()) {
      newErrors.firstName = 'First Name cannot be empty or contain only spaces';
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last Name cannot be empty or contain only spaces';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email cannot be empty or contain only spaces';
    }
    if (!form.title.trim()) {
      newErrors.title = 'Title cannot be empty or contain only spaces';
    }
    
    // Validate phone number has exactly 10 digits
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }
    
    // If there are errors, display them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setSubmitting(true);
    // Find the label for the selected channel value
    const selectedChannel = channels.find(c => c.value === form.channel) || channels[0]; // Fallback to first channel
    const payload = {
      branch: selectedChannel.label, // Will always have a value now
      company: form.company,
      first_name: form.firstName,
      last_name: form.lastName,
      email_address: form.email,
      title: form.title,
      phone_number: form.phone,
    };
    const success = await addContact(payload);
    setSubmitting(false);
    if (success) {
      setForm({
        channel: channels[0]?.value || '', // Reset to first channel
        company: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        title: ''
      });
      onClose();
      if (onSubmit) onSubmit(form);
    } else {
      // Optionally show error
      console.error('Failed to add contact');
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === 'phone') {
      setForm({ ...form, phone: formatUSPhoneNumber(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
    
    // Clear error for this field if validation passes
    if (errors[name]) {
      let isValid = true;
      
      if (name === 'phone') {
        const phoneDigits = value.replace(/\D/g, '');
        isValid = phoneDigits.length === 10;
      } else {
        isValid = value.trim().length > 0;
      }
      
      if (isValid) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full p-0 rounded-2xl mx-auto">
        <DialogHeader className="flex flex-row items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold">Add Marketing Contact</DialogTitle>
          <DialogClose asChild>
          </DialogClose>
        </DialogHeader>
        <form className="flex flex-col gap-4 px-4 sm:px-6 pb-4 sm:pb-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="channel" className="block text-sm font-medium mb-1">Select Channel</Label>
            <select
              id="channel"
              name="channel"
              value={form.channel}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-3 text-base bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6600]/30"
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
              className={errors.company ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.company && (
              <p className="text-red-500 text-xs mt-1 transition-all duration-200 ease-in-out">{errors.company}</p>
            )}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
            <div className="flex-1">
              <Label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Enter First Name"
                required
                className={errors.firstName ? "border-red-500 focus:ring-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1 transition-all duration-200 ease-in-out">{errors.firstName}</p>
              )}
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
                className={errors.lastName ? "border-red-500 focus:ring-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1 transition-all duration-200 ease-in-out">{errors.lastName}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</Label>
            <Input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter Email Address"
              required
              type="email"
              className={errors.email ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 transition-all duration-200 ease-in-out">{errors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="(XXX) XXX-XXXX"
              required
              type="tel"
              maxLength={14}
              className={errors.phone ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 transition-all duration-200 ease-in-out">{errors.phone}</p>
            )}
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
              className={errors.title ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1 transition-all duration-200 ease-in-out">{errors.title}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-1/2 bg-white text-[#ff6600] border border-[#ff6600] hover:bg-[#fff7ed] font-bold py-3 rounded-lg shadow transition-all text-base sm:text-lg"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-1/2 bg-[#ff6600] hover:bg-[#ff7a2f] text-white font-bold py-3 rounded-lg shadow transition-all text-base sm:text-lg"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 