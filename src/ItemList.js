import { compose, withHandlers, withState } from 'recompose'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { groupBy, map } from 'lodash'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Item from './Item'
import React from 'react'
import { defaultStyle } from 'substyle'

function ItemList({
  checkedOffItems,
  collapsedCategories,
  items,
  onClickItemCheck,
  onCollapseCategory,
  onItemRemove,
  packages,
  style,
}) {
  const groupedByCategory = groupBy(items, item => {
    return item.packageIds
  })

  return (
    <div {...style}>
      {map(groupedByCategory, (category, key) => {
        const isCollapsed = collapsedCategories.includes(key)
        return (
          <div key={key}>
            <div>
              <h3 {...style('title')}>
                {packages.find(pack => pack.id === key)
                  ? packages.find(pack => pack.id === key).name
                  : 'Auf die Schnelle'}
              </h3>
              <FontAwesomeIcon
                style={style('collapse')}
                icon={isCollapsed ? faChevronDown : faChevronUp}
                onClick={() => onCollapseCategory(key)}
              />
            </div>

            {!isCollapsed &&
              map(category, (item, key) => {
                const isCheckedOff = checkedOffItems.find(
                  checkedOffItem => checkedOffItem.id === item.id
                )
                return (
                  <Item
                    key={key}
                    isCheckedOff={isCheckedOff}
                    item={item}
                    onClickItemCheck={onClickItemCheck}
                    onItemRemove={onItemRemove}
                  />
                )
              })}
          </div>
        )
      })}
    </div>
  )
}

const styled = defaultStyle(() => {
  return {
    fontSize: 14,
    lineHeight: '24px',
    maxWidth: 250,

    title: {
      display: 'inline-block',
    },

    collapse: {
      float: 'right',
      height: 56,
    },
  }
})

export default compose(
  withState('checkedOffItems', 'setCheckedOffItems', []),
  withState('collapsedCategories', 'setCollapsedCategories', []),
  withHandlers({
    onClickItemCheck: ({ checkedOffItems, setCheckedOffItems }) => (
      clickedItem,
      isCheckedOff
    ) => {
      if (!isCheckedOff) {
        setCheckedOffItems([...checkedOffItems, clickedItem])
        return
      }

      setCheckedOffItems(
        checkedOffItems.filter(
          checkedOffItem => checkedOffItem.id !== clickedItem.id
        )
      )
    },
    onCollapseCategory: ({
      collapsedCategories,
      setCollapsedCategories,
    }) => categoryKey => {
      if (collapsedCategories.includes(categoryKey)) {
        setCollapsedCategories(
          collapsedCategories.filter(
            collapsedCategory => collapsedCategory !== categoryKey
          )
        )
        return
      }

      setCollapsedCategories([...collapsedCategories, categoryKey])
    },
  }),
  styled
)(ItemList)
