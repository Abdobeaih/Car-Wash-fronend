import {describe,it,expect} from 'vitest';
import {render,screen,cleanup} from '@testing-library/react';
import {serviceDescription,addOnDescription} from '@/lib/service-descriptions';
import ServiceDescription from '@/components/ServiceDescription';
const service={name:'Premium Detailing',description:'Our top-tier package with machine polish, paint protection, leather conditioning and a showroom-quality finish.'};
describe('Catalog-backed service descriptions',()=>{
 it('lists only the three stated premium inclusions in both languages',()=>{
  expect(serviceDescription(service,'en')?.includes).toEqual(['Machine polishing','Paint protection treatment','Leather conditioning']);
  expect(serviceDescription(service,'ar')?.includes).toHaveLength(3);
 });
 it('does not retain claims after catalog edits',()=>{
  expect(serviceDescription({...service,description:'New owner description'},'en')).toBeNull();
  expect(addOnDescription({name:'Tire Cleaning',description:'Changed by owner'},'ar')).toBeNull();
 });
 it('renders readable lists in each language',()=>{
  for(const locale of ['en','ar']){
   render(<ServiceDescription service={service} locale={locale}/>);
   expect(screen.getAllByRole('listitem')).toHaveLength(3);cleanup();
  }
 });
 it('preserves unknown owner copy without invented inclusions',()=>{
  render(<ServiceDescription service={{name:'New service',description:'Owner-supplied description'}} locale="en"/>);
  expect(screen.getByText('Owner-supplied description')).toBeInTheDocument();
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
 });
});
