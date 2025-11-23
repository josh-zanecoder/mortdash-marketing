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
  // Only allow up to 10 digits
  const limitedDigits = digits.slice(0, 10);
  if (limitedDigits.length <= 3) return limitedDigits;
  if (limitedDigits.length <= 6) return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
  return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6, 10)}`;
}

export default function EditContactModal({ open, onClose, onSubmit, channels, contact, token }: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (form: any) => void;
  channels: { value: string; label: string }[];
  contact: any;
  token?: string;
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
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);
  const updateContact = useContactStore((s) => s.updateContact);

  useEffect(() => {
    if (contact) {
      // Handle both camelCase and snake_case field names
      const firstName = contact.firstName || contact.first_name || '';
      const lastName = contact.lastName || contact.last_name || '';
      const email = contact.emailAddress || contact.email_address || contact.email || '';
      const phone = contact.phoneNumber || contact.phone_number || contact.phone || '';
      
      setForm({
        channel: channels.find(c => c.label === contact.branch)?.value || channels[0]?.value || '',
        company: contact.company || '',
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
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
    const selectedChannel = channels.find(c => c.value === form.channel) || channels[0];
    // Use camelCase to match API structure
    // Only include fields with valid values (omit null/undefined/empty strings)
    const payload: any = {
      id: contact.id,
      branch: selectedChannel.label,
      company: form.company,
      firstName: form.firstName,
      lastName: form.lastName,
      emailAddress: form.email,
      title: form.title,
      phoneNumber: form.phone,
      bankId: contact.bankId || contact.bank_id || 0,
      rateSheet: contact.rateSheet ?? contact.rate_sheet ?? false,
      hasAccountExecutive: contact.hasAccountExecutive ?? contact.has_account_executive ?? false,
      mktgUnsubscribe: contact.mktgUnsubscribe ?? contact.mktg_unsubscribe ?? false,
    };
    
    // Only include registrationType if it's a valid non-empty string
    const registrationType = contact.registrationType || contact.registration_type;
    if (registrationType && typeof registrationType === 'string' && registrationType.trim().length > 0) {
      payload.registrationType = registrationType;
    }
    
    // Only include branchId if it's a valid non-negative integer
    const branchId = contact.branchId || contact.branch_id;
    if (branchId !== null && branchId !== undefined && !isNaN(Number(branchId)) && Number(branchId) >= 0) {
      payload.branchId = Number(branchId);
    }
    
    const success = await updateContact(payload, token);
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
      <DialogContent className="max-w-md w-[95vw] sm:w-full p-0 rounded-2xl mx-auto">
        <DialogHeader className="flex flex-row items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold">Edit Marketing Contact</DialogTitle>
          <DialogClose className="cursor-pointer" />
        </DialogHeader>
        <form className="flex flex-col gap-4 px-4 sm:px-6 pb-4 sm:pb-6" onSubmit={handleSubmit}>
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
              {channels.filter(c => c.value && c.label).map((c, index) => (
                <option key={`${c.value}-${index}`} value={c.value}>{c.label}</option>
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
              className="cursor-pointer w-full sm:w-1/2 bg-white text-[#ff6600] border border-[#ff6600] hover:bg-[#fff7ed] font-bold py-3 rounded-lg shadow transition-all text-base sm:text-lg"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer w-full sm:w-1/2 bg-[#ff6600] hover:bg-[#ff7a2f] text-white font-bold py-3 rounded-lg shadow transition-all text-base sm:text-lg"
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
