
export const copy = {
  // Landing Page
  landing: {
    hero: {
      title: "Join the Ultimate Challenge Community",
      subtitle: "Transform your habits with 30-day challenges. Connect with friends, track progress, and achieve your goals together.",
      ctaExplore: "Explore Challenges",
      ctaCreate: "Create Challenge"
    },
    features: {
      title: "Why Choose Group Challenge Hub?",
      items: [
        {
          title: "Social Accountability",
          description: "Join friends and stay motivated with real-time progress sharing and encouragement."
        },
        {
          title: "Flexible Tracking",
          description: "Track numbers, upload photos, or just check in daily. Choose what works for you."
        },
        {
          title: "Streak Building",
          description: "Build powerful habits with our streak tracking and celebration system."
        }
      ]
    }
  },
  // Navigation
  nav: {
    dashboard: "Dashboard",
    explore: "Explore",
    create: "Create",
    settings: "Settings",
    pro: "Go Pro"
  },
  // Common Actions
  actions: {
    join: "Join Challenge",
    leave: "Leave Challenge",
    checkin: "Check In",
    invite: "Invite Friends",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit"
  },
  // Challenge States
  challenges: {
    upcoming: "Upcoming",
    active: "Active",
    completed: "Completed",
    private: "Private",
    public: "Public"
  }
} as const;
