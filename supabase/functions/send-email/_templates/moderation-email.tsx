import React from 'react'
import { Link, Text } from '@react-email/components'

import { BoxText } from './components/box-text.tsx'
import { Button } from './components/button.tsx'
import { Layout, urlAppend } from './layout.tsx'
import { Heading } from './components/heading.tsx'

import type {
  Comment,
  News,
  Notification,
  NotificationDisplay,
  TenantSettings,
} from 'oa-shared'
import { Header } from './components/header.tsx'

const text = {
  color: '#686868',
  fontSize: '18px',
  lineHeight: '30px',
  whiteSpace: 'pre',
}

interface IProps {
  notification: NotificationDisplay
  settings: TenantSettings
}

export const ModerationEmail = (props: IProps) => {
  const { notification, settings } = props

  const headingLink = urlAppend(
    `${settings.siteUrl}/${notification.title.parentSlug}`,
    'moderation',
  )
  const buttonLink = urlAppend(
    `${settings.siteUrl}/${notification.slug}`,
    'moderation',
  )
  const preview = `${notification.title.triggeredBy} ${notification.title.middle} your contribution`
  const buttonWording = notification.body ? 'Update it now' : 'See it live'

  return (
    <Layout emailType="moderation" preview={preview} settings={settings}>
      <Header>
        <Link href={headingLink}>
          <Heading>
            <strong>{notification.title.triggeredBy}</strong>{' '}
            {notification.title.middle} {notification.title.parentTitle}
          </Heading>
        </Link>
      </Header>

      {notification.body && (
        <BoxText>
          <Heading>They wrote:</Heading>
          <Text style={text}>{notification.body}</Text>
        </BoxText>
      )}
      <Button href={buttonLink}>{buttonWording}</Button>
    </Layout>
  )
}
