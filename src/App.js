import './App.css'

import { compose, lifecycle, withHandlers, withState } from 'recompose'
import { uniqueId, values } from 'lodash'

import AllFavourites from './AllFavourites'
import FavouriteButton from './FavouriteButton'
import ItemList from './ItemList'
import React from 'react'
import WelcomeScreen from './WelcomeScreen'
import Wizard from './Wizard'
import { database } from './firebase'
import { defaultStyle } from 'substyle'
import { initializeTestData } from './dataUtils'

function App({
  itemName,
  items,
  itemsFromFavourites,
  onKeyDown,
  onInputChange,
  onItemAdd,
  onItemRemove,
  packages,
  setItems,
  setItemsFromFavourites,
  setWizardActive,
  style,
  wizardActive,
}) {
  // if (!selectedMenuItem) {
  //   return <WelcomeScreen onMenuItemSelect={onMenuItemSelect} />
  // }

  return (
    <div {...style} className="App">
      <header className="App-header">
        {
          <div {...style('adHoc')}>
            <div
              {...style('adHocInput')}
              // type="text"
              id="adHocName"
              // value={itemName}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
            >
              {itemName}
            </div>

            <div {...style('adHocAdd')} onClick={onItemAdd}>
              +
            </div>
          </div>
        }
      </header>
      {
        <div>
          <FavouriteButton items={items} />
          <AllFavourites
            setItemsFromFavourites={itemsFromFavourites =>
              setItemsFromFavourites(itemsFromFavourites)
            }
          />
        </div>
      }
      {itemsFromFavourites.length > 0 && (
        <ItemList items={itemsFromFavourites} packages={packages} />
      )}
      {items.length > 0 && (
        <div id="items">
          <ItemList
            items={items}
            onItemRemove={onItemRemove}
            packages={packages}
          />
        </div>
      )}
      {wizardActive ? (
        <Wizard
          onWizardComplete={mappedItems => {
            setItems([...items, ...mappedItems])
          }}
        />
      ) : (
        <button type="input" onClick={() => setWizardActive(true)}>
          Start wizard
        </button>
      )}
    </div>
  )
}
const styled = defaultStyle(() => {
  // const fontSize = 14
  const height = 28
  return {
    fontFamily: 'Inconsolata, monospace',

    itemName: { display: 'inline' },
    adHoc: {
      display: 'flex',
    },
    adHocAdd: {
      backgroundColor: '#dca3a3',
      border: 'none',
      borderRadius: 3,
      // fontSize,
      height,
      lineHeight: `${height}px`,
      marginLeft: 2,
      textAlign: 'center',
      width: height,
    },
    adHocInput: {
      borderRadius: 3,
      border: 'none',
      backgroundColor: 'white',
      flexGrow: 1,
      // fontSize,
      height,
      lineHeight: `${height}px`,
      opacity: 0.6,
      paddingBottom: 0,
      paddingLeft: 4,
    },
  }
})

export default compose(
  withState('itemName', 'setItemName', 'Socken'),
  withState('items', 'setItems', []),
  withState('itemsFromFavourites', 'setItemsFromFavourites', []),
  withState('packages', 'setPackages', []),
  withState('wizardActive', 'setWizardActive', false),
  withHandlers({
    onItemAdd: ({ items, setItems, setItemName, itemName }) => () => {
      if (!itemName) {
        return
      }

      const item = {
        id: uniqueId(),
        name: itemName,
        packageIds: ['adHoc'],
      }

      setItems([...items, item])
      setItemName('')
    },
    onItemRemove: ({ items, setItems }) => removedItem => {
      const updatedItems = items.filter(item => item !== removedItem)
      setItems(updatedItems)
    },
    onInputChange: ({ setItemName }) => ({ target }) => {
      setItemName(target.value)
    },
  }),
  withHandlers({
    onKeyDown: ({ onItemAdd }) => ({ keyCode }) => {
      if (keyCode === 13) {
        onItemAdd()
      }
    },
    onMenuItemSelect: ({ setSelectedMenuItem }) => menuItem => {
      setSelectedMenuItem(menuItem)
    }, //
  }),
  lifecycle({
    componentDidMount() {
      const { setPackages } = this.props
      const ref = database.ref('packages')

      ref.on('value', snapshot => {
        setPackages(values(snapshot.val()))
      })

      // initializeTestData(database)
    },
  }),
  styled
)(App)
