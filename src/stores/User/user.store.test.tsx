import { faker } from '@faker-js/faker'
import { EmailNotificationFrequency } from 'oa-shared'
import { FactoryUser } from 'src/test/factories/User'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UserStore } from './user.store'

import type { ILocation } from 'oa-shared'

vi.mock('../common/module.store')

describe('userStore', () => {
  let store

  beforeEach(() => {
    store = new UserStore({} as any)
  })

  describe('getUserByUsername', () => {
    it('returns a well formed user object', async () => {
      store.db.getWhere.mockReturnValueOnce([
        FactoryUser({
          _authID: 'an-auth-id',
          _id: 'an-auth-id',
          _created: new Date('2023-01-01').toString(),
          _lastActive: new Date('2020-01-01').toString(),
        }),
      ])

      // Act
      const res = await store.getUserByUsername('testUserName')

      // Assert
      expect(res).toEqual(
        expect.objectContaining({
          _id: 'an-auth-id',
        }),
      )
    })
  })

  describe('getUserProfile', () => {
    it('returns a well formed user object', async () => {
      // Lookup1
      store.db.getWhere.mockReturnValueOnce([
        FactoryUser({
          _authID: 'an-auth-id',
          _id: 'an-auth-id',
          _created: new Date('2023-01-01').toString(),
          _lastActive: new Date('2020-01-01').toString(),
        }),
      ])

      // Lookup2
      store.db.getWhere.mockReturnValueOnce([])

      // Assert
      expect(await store.getUserProfile('an-auth-id')).toEqual({
        _contentModifiedTimestamp: expect.any(String),
        _created: expect.any(String),
        _deleted: expect.any(Boolean),
        _lastActive: expect.any(String),
        _id: 'an-auth-id',
        _modified: expect.any(String),
        country: expect.any(String),
        _authID: 'an-auth-id',
        verified: expect.any(Boolean),
        userName: expect.any(String),
        profileType: expect.any(String),
        displayName: expect.any(String),
        coverImages: expect.any(Array),
        links: expect.any(Array),
        notifications: expect.any(Array),
      })
    })

    it('returns a single user object when 2 exist', async () => {
      // Lookup1
      store.db.getWhere.mockReturnValueOnce([
        FactoryUser({
          _authID: 'an-auth-id',
          _id: 'an-auth-id',
          _created: new Date('2023-01-01').toString(),
          _lastActive: new Date('2020-01-01').toString(),
        }),
        FactoryUser({
          _authID: 'an-auth-id',
          _id: 'desired-user-doc',
          _created: new Date('2020-01-01').toString(),
          _lastActive: new Date('2020-01-01').toString(),
        } as any),
      ])

      // Lookup2
      store.db.getWhere.mockReturnValueOnce([])

      // Assert
      expect(await store.getUserProfile('an-auth-id')).toEqual({
        _contentModifiedTimestamp: expect.any(String),
        _created: expect.any(String),
        _deleted: expect.any(Boolean),
        _lastActive: expect.any(String),
        _id: 'desired-user-doc',
        _modified: expect.any(String),
        country: expect.any(String),
        _authID: 'an-auth-id',
        verified: expect.any(Boolean),
        userName: expect.any(String),
        profileType: expect.any(String),
        displayName: expect.any(String),
        coverImages: expect.any(Array),
        links: expect.any(Array),
        notifications: expect.any(Array),
      })
    })

    it('falls back to auth property for lookup when no user found', async () => {
      // Lookup1
      store.db.getWhere.mockReturnValueOnce([])

      // Lookup2
      store.db.getWhere.mockReturnValueOnce([
        FactoryUser({
          _authID: 'an-auth-id',
          _id: 'an-auth-id',
          _created: new Date('2023-01-01').toString(),
          _lastActive: new Date('2020-01-01').toString(),
        }),
      ])

      // Assert
      expect(await store.getUserProfile('an-auth-id')).toEqual({
        _contentModifiedTimestamp: expect.any(String),
        _created: expect.any(String),
        _deleted: expect.any(Boolean),
        _lastActive: expect.any(String),
        _id: 'an-auth-id',
        _modified: expect.any(String),
        country: expect.any(String),
        _authID: 'an-auth-id',
        verified: expect.any(Boolean),
        userName: expect.any(String),
        profileType: expect.any(String),
        displayName: expect.any(String),
        coverImages: expect.any(Array),
        links: expect.any(Array),
        notifications: expect.any(Array),
      })
    })
  })

  describe('updateUserBadge', () => {
    it('updates the user badges in the database', async () => {
      // Act
      await store.updateUserBadge('testUserId', { badge1: true, badge2: false })

      // Assert
      expect(store.db.update).toHaveBeenCalledWith(
        expect.objectContaining({
          badges: { badge1: true, badge2: false },
        }),
      )
    })
  })

  describe('getUserEmailIsVerified', () => {
    it('fetches correct property off authUser', async () => {
      // Act
      const emailVerified = faker.datatype.boolean()
      store.authUser = {
        emailVerified,
      }
      const res = await store.getUserEmailIsVerified()

      // Assert
      expect(res).toEqual(emailVerified)
    })
  })

  describe('updateUserImpact', () => {
    it('throws an error if user undefined', async () => {
      store.activeUser = null

      // Act
      expect(async () => {
        await store.updateUserImpact('testUserId', {
          impact: { total: 100, totalPreciousPlastic: 100 },
        })
      }).rejects.toThrow()
    })

    it('updates the user impact in the database', async () => {
      store.activeUser = FactoryUser({
        _id: 'testUserId',
      })
      const impactYear = faker.number.int({ min: 2019, max: 2023 })
      // Act
      await store.updateUserImpact(
        { impact: { total: 100, totalPreciousPlastic: 100 } },
        impactYear,
      )

      // Assert
      expect(store.db.update).toHaveBeenCalledWith(
        expect.objectContaining({
          [`impact.${impactYear}`]: {
            impact: { total: 100, totalPreciousPlastic: 100 },
          },
        }),
      )
    })
  })

  describe('unsubscribeUser', () => {
    it('throws error for user not found', async () => {
      // Arrange
      store.db.getWhere.mockReturnValueOnce([])

      // Act
      expect(async () => {
        await store.unsubscribeUser('testUserId')
      }).rejects.toThrow('User not found')
    })

    it('unsubscribes the user', async () => {
      // Arrange
      store.db.getWhere.mockReturnValueOnce([FactoryUser()])

      // Act
      await store.unsubscribeUser('testUserId')

      // Assert
      expect(store.db.update).toHaveBeenCalledWith(
        expect.objectContaining({
          notification_settings: {
            emailFrequency: EmailNotificationFrequency.NEVER,
          },
        }),
      )
    })
  })

  describe('updateUserProfile', () => {
    it('sends update only for fields provided', async () => {
      const userProfile = FactoryUser({
        _id: 'my-user-profile',
        profileType: 'workspace',
        profileCreationTrigger: 'test-a',
      })
      store.activeUser = userProfile

      const updateValues = {
        _id: userProfile._id,
        profileType: 'member',
      }

      await store.updateUserProfile(updateValues, 'test-b')

      // Assert
      expect(store.db.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updateValues,
          profileCreationTrigger: 'test-b',
        }),
      )
      expect(store.db.update).toHaveBeenCalledWith(
        expect.not.objectContaining({
          profileCreationTrigger: userProfile.profileCreationTrigger,
        }),
      )
    })

    it('updates the location country code along with the country name', async () => {
      const userProfile = FactoryUser()
      store.activeUser = userProfile

      const updateValues = {
        _id: userProfile._id,
        location: {
          country: 'Nigeria',
        } as ILocation,
      }

      await store.updateUserProfile(updateValues, 'test-b')

      // Assert
      expect(store.db.update).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: updateValues._id,
          location: {
            country: 'Nigeria',
            countryCode: 'NG',
          },
        }),
      )
    })
  })

  describe('updateUserNotificationSettings', () => {
    it('updates notification_settings', async () => {
      const userProfile = FactoryUser({
        _id: 'my-user-profile',
        notification_settings: {
          emailFrequency: EmailNotificationFrequency.WEEKLY,
        },
      })
      store.activeUser = userProfile

      const notification_settings = {
        emailFrequency: EmailNotificationFrequency.DAILY,
      }
      const updateValues = {
        _id: userProfile._id,
        notification_settings,
      }
      await store.updateUserNotificationSettings(updateValues)

      expect(store.db.update).toHaveBeenCalledWith(
        expect.objectContaining({ notification_settings }),
      )
    })

    it('clears the unsubscribe token', async () => {
      const userProfile = FactoryUser({
        _id: 'my-user-profile',
        notification_settings: {
          emailFrequency: EmailNotificationFrequency.NEVER,
        },
        unsubscribeToken: 'anything',
      })
      store.activeUser = userProfile

      const notification_settings = {
        emailFrequency: EmailNotificationFrequency.DAILY,
      }
      const updateValues = {
        _id: userProfile._id,
        notification_settings,
      }
      await store.updateUserNotificationSettings(updateValues)

      expect(store.db.update).toHaveBeenCalledWith(
        expect.objectContaining({
          notification_settings,
          unsubscribeToken: null,
        }),
      )
    })

    it('throws an error is no user id is provided', async () => {
      const values = {}

      expect(async () => {
        await store.updateUserNotificationSettings(values)
      }).rejects.toThrow('User not found')
    })
  })

  describe('deleteUserLocation', () => {
    it('clears user location data', async () => {
      const user = FactoryUser({
        _id: 'my-user-profile',
        profileType: 'member',
      })
      store.activeUser = user

      await store.deleteUserLocation(user)

      expect(store.db.update).toHaveBeenCalledWith(
        expect.objectContaining({
          location: null,
          mapPinDescription: null,
        }),
      )
    })

    it('throws an error is no user id is provided', async () => {
      const values = {}

      expect(async () => {
        await store.deleteUserLocation(values)
      }).rejects.toThrow('User not found')
    })
  })
})
