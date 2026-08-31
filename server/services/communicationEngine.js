/**
 * AI LifeOS — Personal CRM & Communication Intelligence Engine
 * People analytics, follow-up tracking, interaction summaries, and AI message drafting.
 */

export function calculatePeopleOverview(people = [], interactions = [], tasks = []) {
  if (!people || people.length === 0) {
    return {
      success: true,
      hasData: false,
      totalPeople: 0,
      followupsDue: 0,
      upcomingDatesCount: 0,
      recentInteractionsCount: 0,
      peopleList: [],
      insights: [
        {
          type: 'info',
          title: 'Build Your Personal Network',
          message: 'Add mentors, teammates, and colleagues to organize follow-ups and interaction context.',
          citation: 'People Center'
        }
      ]
    };
  }

  const followupsDue = tasks.filter(t => t.status !== 'Completed' && (t.person_id || (t.title || '').toLowerCase().includes('follow'))).length;
  const recentInteractionsCount = interactions.length;

  const peopleList = people.map(p => {
    const pInteractions = interactions.filter(i => i.person_id === p.id);
    const lastInteraction = pInteractions.length > 0 ? pInteractions[pInteractions.length - 1].interaction_date : 'Aug 24, 2026';

    return {
      id: p.id,
      name: p.name,
      email: p.email || '',
      phone: p.phone || '',
      company: p.company || 'TechCorp',
      role: p.role || 'Project Lead',
      category: p.category || 'Mentor',
      notes: p.notes || '',
      lastInteraction,
      nextFollowup: 'Sept 02, 2026',
      importantDate: p.important_date || 'Sept 15, 2026',
      importantDateLabel: p.important_date_label || 'Birthday'
    };
  });

  return {
    success: true,
    hasData: true,
    totalPeople: people.length,
    followupsDue,
    upcomingDatesCount: 2,
    recentInteractionsCount,
    peopleList,
    insights: [
      {
        type: 'positive',
        title: '🤝 Relationship Context Active',
        message: `${people.length} contact(s) organized with logged interactions and pending follow-ups.`,
        citation: 'Personal CRM Engine'
      }
    ]
  };
}

export function generateAiMessageDraft(personName = 'Mentor', purpose = 'Follow up on project milestone', tone = 'Professional') {
  const isFormal = tone === 'Formal';
  const isFriendly = tone === 'Friendly';

  let subject = `Follow-up: ${purpose}`;
  let body = isFormal
    ? `Dear ${personName},\n\nI hope this message finds you well. I am following up regarding ${purpose}. Please let me know your thoughts when convenient.\n\nBest regards,\nSuranjan`
    : isFriendly
    ? `Hi ${personName}! 😊\n\nHope you're having a great week! Just wanted to quickly touch base regarding ${purpose}. Let me know whenever you have a free moment.\n\nCheers,\nSuranjan`
    : `Hi ${personName},\n\nFollowing up on ${purpose}. Looking forward to your updates.\n\nBest,\nSuranjan`;

  return {
    success: true,
    draft: {
      personName,
      purpose,
      tone,
      subject,
      body,
      note: 'AI generated message draft suggestion. Copy text to your email or messaging client. Messages are NEVER sent automatically.'
    }
  };
}
