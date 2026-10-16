import { Seo } from '@/components/layout/Seo'
import { Hero } from '@/components/sections/home/Hero'
import { Manifesto } from '@/components/sections/home/Manifesto'
import { SelectedWork } from '@/components/sections/home/SelectedWork'
import { Stack } from '@/components/sections/Stack'
import { AboutTeaser } from '@/components/sections/home/AboutTeaser'
import { ContactCTA } from '@/components/sections/ContactCTA'

export default function HomePage() {
  return (
    <>
      <Seo />
      <Hero />
      <Manifesto />
      <SelectedWork />
      <Stack index="03" />
      <AboutTeaser />
      <ContactCTA index="05" />
    </>
  )
}
