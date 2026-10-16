import { Seo } from '@/components/layout/Seo'
import { Hero } from '@/components/sections/home/Hero'
import { Manifesto } from '@/components/sections/home/Manifesto'
import { SelectedWork } from '@/components/sections/home/SelectedWork'
import { Stack } from '@/components/sections/Stack'
import { Profile } from '@/components/sections/home/Profile'
import { ContactCTA } from '@/components/sections/ContactCTA'

export default function HomePage() {
  return (
    <>
      <Seo />
      <Hero />
      <Manifesto />
      <SelectedWork />
      <Stack index="03" />
      <Profile />
      <ContactCTA index="05" />
    </>
  )
}
