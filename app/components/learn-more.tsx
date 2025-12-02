import { Github, Users } from 'lucide-react';
import React from 'react';
import FeatureCard from './feature-card';

const learnMoreItems = [
  {
    icon: Github,
    title: 'Join the Conversation',
    description:
      'Contribute to our openly maintained repositories and help shape the future of GRSS VEDA.',
    buttonText: 'View Repositories',
    buttonHref: 'https://github.com/ieee-grss-veda',
  },
  {
    icon: Users,
    title: 'Get Support',
    description:
      'Have questions, feedback, or need help? Submit a support ticket',
    buttonText: 'Submit Support Ticket',
    buttonHref: 'https://grss-ieee.atlassian.net/servicedesk/',
  },
];

export default function LearnMore() {
  return (
    <section className='py-16  bg-muted/30'>
      <div className='max-w-[1400px] mx-auto px-6 lg:px-12'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-4xl   mb-8'>Learn More</h2>

          <div className='grid md:grid-cols-2 gap-6'>
            {learnMoreItems.map((item) => (
              <FeatureCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                showButton={true}
                buttonText={item.buttonText}
                buttonHref={item.buttonHref}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
