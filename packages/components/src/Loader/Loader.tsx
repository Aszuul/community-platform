import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { Flex, Image, Text, useThemeUI } from 'theme-ui'

import type { ThemeWithName } from 'oa-themes'
import type { ThemeUIStyleObject } from 'theme-ui'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`

const RotatingLogo = styled(Image)`
  animation: ${rotate} 2s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite;
  padding: 1rem;
`

export interface Props {
  label?: string
  sx?: ThemeUIStyleObject | undefined
}

export const Loader = ({ label, sx }: Props) => {
  const themeUi = useThemeUI()
  const theme = themeUi.theme as ThemeWithName
  const logo = theme.logo || null

  return (
    <Flex sx={{ flexWrap: 'wrap', justifyContent: 'center', ...sx }}>
      {logo && (
        <RotatingLogo
          loading="lazy"
          data-cy="loader"
          data-testid="loader"
          src={logo}
          sx={{ width: [75, 75, 100] }}
        />
      )}
      <Text sx={{ width: '100%', textAlign: 'center' }}>
        {label || 'Loading...'}
      </Text>
    </Flex>
  )
}
