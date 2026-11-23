'use client';
import {useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {useTransition} from 'react';

export default function CatalogueRetry() {
 const t=useTranslations('Services'),c=useTranslations('Common');
 const router=useRouter();const [pending,start]=useTransition();
 return <section className="container-page py-16" role="alert"><h1 className="display-title text-3xl">{t('emptyTitle')}</h1><p className="mt-4 text-gray-500">{t('emptyDescription')}</p><button type="button" className="btn-primary mt-6" disabled={pending} aria-busy={pending} onClick={()=>start(()=>router.refresh())}>{c('tryAgain')}</button></section>;
}
