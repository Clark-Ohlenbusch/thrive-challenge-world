
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, BarChart, Tag } from 'lucide-react';

interface DetailsTabProps {
  challenge: any;
}

export function DetailsTab({ challenge }: DetailsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Challenge Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {challenge.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground leading-relaxed">
                {challenge.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-medium">Duration</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(challenge.start_date), 'MMM d, yyyy')} - {format(new Date(challenge.end_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <BarChart className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Frequency</h4>
                  <Badge variant="secondary" className="capitalize">
                    {challenge.frequency}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-purple-500" />
                <div>
                  <h4 className="font-medium">Category</h4>
                  <Badge variant="outline">{challenge.category}</Badge>
                </div>
              </div>

              {challenge.goal_numeric && (
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-orange-500" />
                  <div>
                    <h4 className="font-medium">Goal</h4>
                    <p className="text-sm text-muted-foreground">
                      {challenge.goal_numeric} {challenge.unit_label || 'units'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Challenge Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{challenge.memberships.length}</p>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.max(...challenge.memberships.map((m: any) => m.streak), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.ceil((new Date(challenge.end_date).getTime() - new Date(challenge.start_date).getTime()) / (1000 * 60 * 60 * 24))}
              </p>
              <p className="text-sm text-muted-foreground">Total Days</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </p>
              <p className="text-sm text-muted-foreground">Days Left</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
