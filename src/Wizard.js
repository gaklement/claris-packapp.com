import { compose, withHandlers, withState } from 'recompose'
import { flatten, isNil, uniqueId, values } from 'lodash'

import React from 'react'
import { database } from './firebase'
import { defaultStyle } from 'substyle'
import wizardQuestions from './wizardQuestions'

function Wizard({
  currentQuestionId,
  onNextClick,
  pendingAnswer,
  setPendingAnswer,
  style,
}) {
  const wizardEnd = !wizardQuestions[currentQuestionId]

  return (
    <div {...style}>
      {!wizardEnd && (
        <div id="question">{`${wizardQuestions[currentQuestionId].question}`}</div>
      )}
      {!wizardEnd &&
        wizardQuestions[currentQuestionId].answers.map((answer, key) => (
          <div key={key} {...style('answer')}>
            <input
              key={answer.id}
              type="radio"
              name="answer"
              value={answer.id}
              onClick={() => setPendingAnswer(answer.id)}
            />
            <div>{answer.option}</div>
          </div>
        ))}
      {!wizardEnd && (
        <button
          id="next"
          onClick={onNextClick}
          type="text"
          disabled={isNil(pendingAnswer)}
        >
          Next
        </button>
      )}
    </div>
  )
}

const styled = defaultStyle(() => ({
  width: 400,
  backgroundColor: 'lightblue',
  margin: 'auto',

  answer: {
    display: 'flex',
  },
}))

export default compose(
  withState('currentQuestionId', 'setCurrentQuestionId', 0),
  withState('givenAnswers', 'setGivenAnswers', []),
  withState('pendingAnswer', 'setPendingAnswer'),
  withHandlers({
    resolveItems: ({ givenAnswers, onWizardComplete, pendingAnswer }) => () => {
      const packageIdsFromAnswers = getMappedPackageIds({
        givenAnswers,
        pendingAnswer,
      })

      const ref = database.ref('items')

      ref.on('value', snapshot => {
        const allItems = values(snapshot.val())

        // get all the items that include one or more of the packageIds from the answers
        // then replace the item's packageIds array with only one of packageIds from the answers
        // so in the final packlist the items with multiple packageIds only get listed once,
        // and can be grouped in one key later in the processing
        const mappedItems = allItems
          .filter(item => {
            let includesPackage
            packageIdsFromAnswers.forEach(packageIdsFromAnswer => {
              if (item.packageIds.includes(packageIdsFromAnswer)) {
                includesPackage = true
              }
            })
            return includesPackage
          })
          .map(item => {
            return {
              ...item,
              packageIds: [
                item.packageIds.find(packageId =>
                  packageIdsFromAnswers.includes(packageId)
                ),
              ],
            }
          })

        onWizardComplete(mappedItems)
      })
    },
  }),
  withHandlers({
    onNextClick: ({
      currentQuestionId,
      resolveItems,
      givenAnswers,
      onWizardComplete,
      pendingAnswer,
      setCurrentQuestionId,
      setGivenAnswers,
      setPendingAnswer,
    }) => () => {
      const wizardEnd = !wizardQuestions[currentQuestionId + 1]

      if (wizardEnd) {
        resolveItems()
      }

      setPendingAnswer(null)
      setGivenAnswers([...givenAnswers, pendingAnswer])
      setCurrentQuestionId(currentQuestionId + 1)
    },
  }),
  styled
)(Wizard)

function addId(mappedItems) {
  return mappedItems.map(itemName => ({ id: uniqueId(), name: itemName }))
}

function getMappedPackageIds({ givenAnswers, pendingAnswer }) {
  const answers = flatten(
    wizardQuestions.reduce(
      (question, currentValue) => [...question, currentValue.answers],
      []
    )
  )

  const matchingAnswers = answers.filter(answerOption =>
    [...givenAnswers, pendingAnswer].includes(answerOption.id)
  )

  const packageIds = flatten(
    matchingAnswers.map(matchingAnswer => matchingAnswer.packageIds)
  )

  return packageIds
}
