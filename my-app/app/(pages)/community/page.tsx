import CommunityPosts from '@/components/HomePageComponents/CommunityPosts';
import { PageHero } from '@/components/PageHero';

export default function CommunityPage() {
  return (
    <>
      <PageHero
        title="Community"
        description="Explore shared designs, leave feedback and rate ideas, and get inspiration for your next design."
        subtitle="A gallery for inspiration, collaboration, and design discovery."
      />

      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <CommunityPosts />
        </div>
      </main>
    </>
  );
}
