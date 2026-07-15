import { getMapProjects } from '@/lib/data';
import ThreeDView from './ThreeDView';

export const metadata = {
  title: '3D Playground',
  description: 'WebGL experiments for the WAG site — railway track scene + Kazakhstan project map.',
  robots: { index: false, follow: false },
};

export default async function ThreeDPlaygroundPage() {
  const projects = await getMapProjects();
  return <ThreeDView projects={projects} />;
}
