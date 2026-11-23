import {notFound} from 'next/navigation';
import EnrollmentsPanel from '@/components/EnrollmentsPanel';
export const dynamic='force-dynamic';
export default function Page(){if(process.env.ENABLE_PLAN_ENROLLMENTS!=='true')notFound();return <EnrollmentsPanel/>;}
