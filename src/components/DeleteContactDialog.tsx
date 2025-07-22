import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function DeleteContactDialog({ open, onClose, onConfirm, contact }: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contact: any;
}) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md w-full p-0 rounded-2xl">
        <DialogHeader className="flex flex-col items-center justify-center pt-8 pb-2">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 mb-3">
            <Trash2 className="w-8 h-8 text-orange-500" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">Delete Contact</DialogTitle>
        </DialogHeader>
        <div className="px-8 pb-8 text-center">
          <p className="mb-6 text-base text-gray-700">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{contact?.first_name} {contact?.last_name}</span>?
            <br />This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-1/2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold py-3 shadow-sm transition-all text-base"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-1/2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 shadow-sm transition-all text-base border-0"
              onClick={() => {
                onConfirm();
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 