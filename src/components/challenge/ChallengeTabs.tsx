
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedTab } from './FeedTab';
import { LeaderboardTab } from './LeaderboardTab';
import { DetailsTab } from './DetailsTab';

interface ChallengeTabsProps {
  challenge: any;
  realtimeUpdate?: number;
}

export function ChallengeTabs({ challenge, realtimeUpdate }: ChallengeTabsProps) {
  return (
    <Tabs defaultValue="feed" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="feed">Feed</TabsTrigger>
        <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>
      
      <TabsContent value="feed">
        <FeedTab challengeId={challenge.id} realtimeUpdate={realtimeUpdate} />
      </TabsContent>
      
      <TabsContent value="leaderboard">
        <LeaderboardTab challengeId={challenge.id} />
      </TabsContent>
      
      <TabsContent value="details">
        <DetailsTab challenge={challenge} />
      </TabsContent>
    </Tabs>
  );
}
