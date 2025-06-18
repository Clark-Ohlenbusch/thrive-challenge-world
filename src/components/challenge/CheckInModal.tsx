
import { useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { uploadPhoto } from '@/integrations/storage/uploadPhoto';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Camera } from 'lucide-react';
import Confetti from 'react-confetti';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: any;
  membership: any;
  onSuccess: () => void;
}

export function CheckInModal({ isOpen, onClose, challenge, membership, onSuccess }: CheckInModalProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState({
    value_numeric: '',
    note: '',
    photo: null as File | null
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setFormData(prev => ({ ...prev, photo: file }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already checked in today
      const { data: existingEntry } = await supabase
        .from('entries')
        .select('id')
        .eq('membership_id', membership.id)
        .eq('entry_date', today)
        .single();

      if (existingEntry) {
        toast.error('You have already checked in today!');
        return;
      }

      let photoUrl = null;
      
      // Upload photo if provided
      if (formData.photo) {
        const uploadResult = await uploadPhoto(formData.photo, user.id);
        photoUrl = uploadResult.url;
      }

      // Create entry
      const { error: entryError } = await supabase
        .from('entries')
        .insert({
          membership_id: membership.id,
          entry_date: today,
          value_numeric: formData.value_numeric ? parseInt(formData.value_numeric) : null,
          note: formData.note || null,
          photo_url: photoUrl
        });

      if (entryError) throw entryError;

      // Update streak - simplified logic for now
      const newStreak = membership.last_checkin === 
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
        ? membership.streak + 1 
        : 1;

      const { error: membershipError } = await supabase
        .from('memberships')
        .update({
          streak: newStreak,
          last_checkin: today
        })
        .eq('id', membership.id);

      if (membershipError) throw membershipError;

      // Show confetti for first check-in or new streak
      if (membership.streak === 0 || newStreak > membership.streak) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      toast.success('Check-in successful! 🎉');
      onSuccess();
      
      // Reset form
      setFormData({ value_numeric: '', note: '', photo: null });
      setPhotoPreview(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to check in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Daily Check-in</DialogTitle>
            <DialogDescription>
              Record your progress for {challenge.title}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {challenge.unit_label && (
              <div>
                <Label htmlFor="value">
                  {challenge.unit_label} {challenge.goal_numeric && `(Goal: ${challenge.goal_numeric})`}
                </Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  placeholder={`Enter ${challenge.unit_label.toLowerCase()}`}
                  value={formData.value_numeric}
                  onChange={(e) => setFormData(prev => ({ ...prev, value_numeric: e.target.value }))}
                />
              </div>
            )}

            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                placeholder="How did it go? Any thoughts to share?"
                maxLength={220}
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.note.length}/220 characters
              </p>
            </div>

            <div>
              <Label>Photo (optional)</Label>
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removePhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload a photo</p>
                  <p className="text-xs text-gray-500 mt-1">JPEG, PNG up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Checking in...' : 'Check In'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
