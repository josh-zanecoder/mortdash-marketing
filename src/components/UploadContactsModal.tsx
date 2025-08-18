import { useRef, useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function UploadContactsModal({ open, onClose, onSuccess }: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleClickUpload() {
    fileInputRef.current?.click();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/contacts/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to upload contacts');
      }
      setFile(null);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload contacts');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md w-full p-0 rounded-2xl">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold">Marketing Contact</DialogTitle>
          <DialogClose asChild>
          </DialogClose>
        </DialogHeader>
        <form className="flex flex-col gap-4 px-6 pb-6" onSubmit={handleSubmit}>
          <div>
            <div className="text-base font-semibold mb-3">Upload a Marketing Contact File</div>
            <div
              className="border-2 border-gray-300 rounded-xl flex flex-col items-center justify-center py-10 px-4 text-center cursor-pointer bg-white hover:bg-gray-50 transition"
              onClick={handleClickUpload}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <UploadCloud className="mx-auto mb-2 text-gray-400" size={40} />
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Click to upload</span>
              <span className="text-gray-600"> or drag and drop</span>
              <div className="mt-2 text-gray-500 text-sm">.XLSX (MAX FILE SIZE 100MB)</div>
              {file && <div className="mt-2 text-sm text-green-700">Selected: {file.name}</div>}
            </div>
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              className="w-1/2 bg-white text-[#ff6600] border border-[#ff6600] hover:bg-[#fff7ed] font-bold py-3 rounded-lg shadow transition-all text-lg"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-1/2 bg-[#ff6600] hover:bg-[#ff7a2f] text-white font-bold py-3 rounded-lg shadow transition-all text-lg"
              disabled={!file || loading}
            >
              {loading ? 'Uploading...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 