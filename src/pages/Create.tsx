import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { copy } from '@/lib/copy';
import { generateSlug } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/clerk-react';

const categories = ['Fitness', 'Reading', 'Wellness', 'Creativity', 'Learning', 'Productivity'];

export default function Create() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    frequency: 'daily' as 'daily' | 'weekly',
    unitLabel: '',
    goalNumeric: '',
    isPublic: true,
    inviteEmails: ''
  });

  const createChallenge = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const slug = generateSlug(data.title);
      
      const { data: challenge, error } = await supabase
        .from('challenges')
        .insert({
          title: data.title,
          slug,
          description: data.description,
          category: data.category,
          start_date: data.startDate,
          end_date: data.endDate,
          frequency: data.frequency,
          unit_label: data.unitLabel || null,
          goal_numeric: data.goalNumeric ? parseInt(data.goalNumeric) : null,
          is_public: data.isPublic,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Create owner membership
      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          challenge_id: challenge.id,
          user_id: user.id
        });

      if (membershipError) throw membershipError;

      return challenge;
    },
    onSuccess: (challenge) => {
      toast({
        title: "Challenge created!",
        description: "Your challenge has been created successfully."
      });
      navigate(`/challenge/${challenge.slug}`);
    },
    onError: (error) => {
      console.error('Create challenge error:', error);
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createChallenge.mutate(formData);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Challenge</h1>
          <p className="text-muted-foreground">
            Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Challenge Rules' : 'Invite Friends'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Basic Information</CardTitle>
                <CardDescription>
                  Tell us about your challenge and what it's all about.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Challenge Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., 10,000 Steps Daily"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your challenge, goals, and what participants should expect..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep} disabled={!formData.title || !formData.category}>
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Challenge Rules</CardTitle>
                <CardDescription>
                  Set up the timeline and tracking method for your challenge.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Check-in Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value: 'daily' | 'weekly') => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitLabel">Unit Label (Optional)</Label>
                    <Input
                      id="unitLabel"
                      placeholder="e.g., steps, pages, minutes"
                      value={formData.unitLabel}
                      onChange={(e) => setFormData({ ...formData, unitLabel: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goalNumeric">Daily Goal (Optional)</Label>
                    <Input
                      id="goalNumeric"
                      type="number"
                      placeholder="e.g., 10000"
                      value={formData.goalNumeric}
                      onChange={(e) => setFormData({ ...formData, goalNumeric: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                  <Label htmlFor="isPublic">Make this challenge public</Label>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep} disabled={!formData.startDate || !formData.endDate}>
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Invite Friends</CardTitle>
                <CardDescription>
                  Invite friends to join your challenge (optional).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmails">Email Addresses</Label>
                  <Textarea
                    id="inviteEmails"
                    placeholder="Enter email addresses separated by commas..."
                    value={formData.inviteEmails}
                    onChange={(e) => setFormData({ ...formData, inviteEmails: e.target.value })}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    You can also invite people later from the challenge page.
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="submit" disabled={createChallenge.isPending}>
                    {createChallenge.isPending ? 'Creating...' : 'Create Challenge'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </Layout>
  );
}
