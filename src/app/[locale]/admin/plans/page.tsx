import {notFound} from 'next/navigation';
import AdminEnrollments from '@/components/AdminEnrollments';
export const dynamic='force-dynamic';
export default function Page(){if(process.env.ENABLE_PLAN_ENROLLMENTS!=='true')notFound();return <AdminEnrollments/>;}
