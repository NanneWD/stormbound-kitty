import React from 'react'
import { Link, useRouteMatch } from 'react-router-dom'
import cards from '../../data/cards'
import decks from '../../data/decks'
import CardLevelField from '../DeckBuilderCardLevelField'
import CardsGallery from '../CardsGallery'
import Column from '../Column'
import Deck from '../Deck'
import EmptySearch from '../EmptySearch'
import Filtering from '../DeckBuilderFiltering'
import Filters from '../DeckBuilderEditorFilters'
import ImportCollection from '../DeckBuilderImportCollection'
import PageMeta from '../PageMeta'
import RandomDeckButton from '../DeckBuilderRandomDeckButton'
import ResetButton from '../ResetButton'
import Row from '../Row'
import ShareButton from '../DeckBuilderShareButton'
import Title from '../Title'
import hookIntoProps from '../../helpers/hookIntoProps'
import useViewportWidth from '../../helpers/useViewportWidth'
import resolveCardForLevel from '../../helpers/resolveCardForLevel'
import './index.css'

class DeckBuilderEditorView extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      cardLevel: 1,
      withCustomCollection: false,
      collection: cards,
      hasImported: null,
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.captureKeyboardEvents)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.captureKeyboardEvents)
  }

  captureKeyboardEvents = event => {
    const key = event.which
    const keys = [49, 50, 51, 52, 53]
    const padKeys = [97, 98, 99, 100, 101]

    if (keys.includes(key) || padKeys.includes(key)) {
      const level = Math.max(keys.indexOf(key), padKeys.indexOf(key))
      this.setCardLevel(level + 1)
    }
  }

  setCardLevel = cardLevel => this.setState({ cardLevel })

  addCardToDeck = id => {
    if (this.isCardMissing(id)) {
      return
    }

    const level = this.state.withCustomCollection
      ? this.state.collection.find(card => card.id === id).level
      : this.state.cardLevel

    this.props.addCardToDeck({ id, level })
  }

  isCardMissing = id =>
    this.state.collection.find(card => card.id === id).missing

  onCollectionImport = collection =>
    this.setState(
      {
        collection: collection || this.state.collection,
        hasImported: !!collection,
        withCustomCollection: true,
      },
      () => {
        setTimeout(() => this.setState({ hasImported: null }), 3000)
        this.props.deck.forEach(cardInDeck => {
          const cardInCollection = collection.find(
            cardInCollection => cardInCollection.id === cardInDeck.id
          )

          if (cardInCollection.missing) {
            this.props.removeCardFromDeck({ id: cardInDeck.id })
          } else if (cardInCollection.level !== cardInDeck.level) {
            this.addCardToDeck(cardInDeck.id)
          }
        })
      }
    )

  render() {
    const matchedDeck = decks.find(deck => deck.id === this.props.deckId)
    const cardCollection = this.state.collection.map(card =>
      resolveCardForLevel({
        ...card,
        level: this.state.withCustomCollection
          ? card.level
          : this.state.cardLevel,
      })
    )

    return (
      <>
        <h1 className='visually-hidden'>Deck Builder</h1>

        <Row desktopOnly wideGutter>
          <Column width={33}>
            <Title>Your deck</Title>

            <Deck
              id='deck'
              deck={this.props.deck}
              onClick={this.props.removeCardFromDeck}
              onClickLabel='Remove card from deck'
              highlightedCards={this.props.highlightedCards}
            />

            {this.props.deck.length > 0 && (
              <>
                <Row>
                  <Column>
                    <ResetButton
                      label='Reset deck'
                      confirm='Are you sure you want to reset your deck?'
                      reset={this.props.reset}
                    />
                  </Column>
                  <Column>
                    <ShareButton />
                  </Column>
                </Row>
              </>
            )}

            {matchedDeck ? (
              <p>
                This deck is named “{matchedDeck.name}” and has been made by{' '}
                {matchedDeck.author}.
              </p>
            ) : (
              <>
                <p>
                  If you do not know where to start,{' '}
                  <Link to='/deck/guide'>read the guide</Link> to learn how to
                  make a viable deck, or try one of the{' '}
                  <Link to='/deck/suggestions'>
                    ready-to-go suggested decks
                  </Link>
                  .
                </p>
              </>
            )}

            <RandomDeckButton
              defineDeck={this.props.defineDeck}
              collection={this.state.collection}
            />

            <>
              {!this.state.withCustomCollection && (
                <>
                  <p>
                    If you have already{' '}
                    <Link to='/deck/collection'>created your collection</Link>,
                    you can import it directly in the deck builder to compose
                    decks that you can make in-game.
                  </p>
                  <ImportCollection onChange={this.onCollectionImport} />
                </>
              )}

              {this.state.hasImported !== null && (
                <p>
                  {this.state.hasImported
                    ? '✓ Your collection has been successfully imported!'
                    : '✘ Unfortunately their was an error importing your collection.'}
                </p>
              )}
            </>
          </Column>

          <Column width={66}>
            <div className='DB__collection'>
              <Title>Cards collection</Title>

              <Filtering cards={cardCollection}>
                {({
                  filters,
                  filtersSetters,
                  collection,
                  resetFilters,
                  cardsPerPage,
                }) => (
                  <>
                    <Filters
                      {...filters}
                      {...filtersSetters}
                      resetFilters={resetFilters}
                    />

                    {collection.length > 0 ? (
                      <CardsGallery
                        filters={filters}
                        cards={collection}
                        onCardClick={this.addCardToDeck}
                        cardsPerPage={cardsPerPage}
                        isCardInDeck={id =>
                          this.props.deck.map(card => card.id).includes(id)
                        }
                        isCardMissing={this.isCardMissing}
                        navChildren={
                          this.state.withCustomCollection ? null : (
                            <CardLevelField
                              cardLevel={this.state.cardLevel}
                              setCardLevel={this.setCardLevel}
                            />
                          )
                        }
                      />
                    ) : (
                      <EmptySearch
                        title='No cards found'
                        resetFilters={resetFilters}
                      />
                    )}
                  </>
                )}
              </Filtering>
            </div>
          </Column>
        </Row>

        <PageMeta title='Deck Builder' description='Compose your own deck.' />
      </>
    )
  }
}

export default hookIntoProps(() => ({
  viewportWidth: useViewportWidth(),
  deckId: useRouteMatch().params.deckId,
}))(props => <DeckBuilderEditorView {...props} />)
