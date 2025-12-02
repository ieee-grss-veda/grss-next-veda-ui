import { Badge } from '../components/ui/badge';
import FeatureCard from './feature-card';

export default function WhoWeServe() {
  const whoWeServe = [
    {
      emoji: '🎓',
      title: 'Students, Early-Career Researchers & Innovators',
      description:
        'Access Earth observation datasets and AI tools in a low-code, cloud environment for hands-on learning, experimentation, and skill-building through workshops and summer schools, connecting with the global community for collaboration and visibility.',
    },
    {
      emoji: '🔬',
      title: 'Researchers & Scientists',
      description:
        'Analyze, fine-tune, and validate models using standardized datasets; enable reproducible research with FAIR-compliant data, version control, and collaborative workspaces.',
    },
    {
      emoji: '💼',
      title: 'Professionals & Practitioners',
      description:
        'Apply ready-to-use AI tools for geospatial tasks, perform cloud-scale analytics without custom infrastructure, and collaborate across sectors using shared datasets and workflows.',
    },
    {
      emoji: '👨‍🏫',
      title: 'Educators & Trainers',
      description:
        'Teach geospatial data processing and AI through interactive visualizations and labeling tools; allow students to access real datasets and contribute to scientific projects.',
    },
    {
      emoji: '🤝',
      title: 'Technical Committees & Working Groups',
      description:
        'Develop, test, and showcase community tools; integrate open-source standards and FAIR-aligned datasets for collaborative innovation.',
    },
  ];
  return (
    <>
      <section
        className='py-24 bg-muted/30'
        aria-labelledby='who-we-serve-heading'
      >
        <div className='max-w-[1400px] mx-auto px-6 lg:px-12'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-12'>
              <Badge className='mb-4' variant='secondary'>
                For Everyone
              </Badge>
              <h2 id='who-we-serve-heading' className='text-4xl mb-6'>
                Who We Serve
              </h2>
              <p className='text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed'>
                GRSS VEDA serves the diverse community of GRSS members,
                providing tools and resources tailored to support learning,
                research, collaboration, and innovation in geospatial AI and
                Earth observation.
              </p>
            </div>

            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {whoWeServe.map((audience, index) => (
                <FeatureCard
                  key={index}
                  title={audience.title}
                  description={audience.description}
                  iconContainerClassName='w-14 h-14 rounded-full flex items-center justify-center mb-4'
                  iconSlot={
                    <div
                      className='w-full h-full flex items-center justify-center rounded-full'
                      style={{
                        backgroundColor:
                          index % 2 === 0
                            ? 'var(--ieee-blue-lightest)'
                            : 'var(--ieee-blue-lighter)',
                      }}
                    >
                      <span className='text-3xl'>{audience.emoji}</span>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
