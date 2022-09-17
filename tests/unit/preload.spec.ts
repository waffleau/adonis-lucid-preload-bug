import { test } from '@japa/runner'

import Database from '@ioc:Adonis/Lucid/Database'

import Category from 'App/Models/Category'
import Topic from 'App/Models/Topic'

test.group('Group name', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('reproduced preload bug', async ({ assert }) => {
    const [topic1, topic2, topic3] = await Topic.updateOrCreateMany('name', [
      { name: 'Topic 1' },
      { name: 'Topic 2' },
      { name: 'Topic 3' },
    ])

    const [category1, category2, category3] = await Category.updateOrCreateMany('name', [
      { name: 'Category 1' },
      { name: 'Category 2' },
      { name: 'Category 3' },
    ])

    await topic1.related('categories').attach([category1.id, category2.id, category3.id])
    await topic2.related('categories').attach([category1.id, category2.id, category3.id])
    await topic3.related('categories').attach([category1.id, category2.id, category3.id])

    const topics = await Topic.query().preload('categories')

    assert.lengthOf(topics[0].categories, 3)
    assert.lengthOf(topics[1].categories, 3)
    assert.lengthOf(topics[2].categories, 3)
  })

  test('working preload', async ({ assert }) => {
    const [topic1, topic2, topic3] = await Topic.updateOrCreateMany('name', [
      { name: 'Topic 1' },
      { name: 'Topic 2' },
      { name: 'Topic 3' },
    ])

    const [category1, category2, category3] = await Category.updateOrCreateMany('name', [
      { name: 'Category 1' },
      { name: 'Category 2' },
      { name: 'Category 3' },
    ])

    await topic1.related('categories').attach([category1.id, category2.id, category3.id])
    await topic2.related('categories').attach([category1.id, category2.id, category3.id])
    await topic3.related('categories').attach([category1.id, category2.id, category3.id])

    const topics = await Topic.query()

    await topics[0].load('categories')
    await topics[1].load('categories')
    await topics[2].load('categories')

    assert.lengthOf(topics[0].categories, 3)
    assert.lengthOf(topics[1].categories, 3)
    assert.lengthOf(topics[2].categories, 3)
  })
})
