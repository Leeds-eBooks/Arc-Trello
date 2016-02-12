import readJSON from 'then-read-json'
import Lazy from 'lazy.js'
import _ from 'underscore-contrib-up-to-date'
import dedent from 'dedent'

void async function() {
  try {
    const {lists, cards} = await readJSON('./export.json')

    const processed = Lazy(cards)
      .reject('closed')
      .map(({name, labels, idList}) => ({name, labels, idList}))
      .map(card => {
        card.series = card.labels.map(label => label.name).filter(name => name !== 'AI done')[0]
        return card
      })
      .map(card => {
        card.month = lists.find(({id}) => id === card.idList).name
        return card
      })
      .groupBy('month')
      .toObject()

    const output = _.reduce(processed, (reduction, cards, month) =>
      dedent`${reduction}

        ${month}

        ${Lazy(cards).map(card => `${card.name.replace(' - ', ' – ')} (${card.series})`).join('\n')}
      `
    , '')

    console.log(output)

  } catch (e) {
    console.error(e)
  }
}()
