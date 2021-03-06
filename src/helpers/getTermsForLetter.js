import terms from '../data/terms'

export default letter =>
  Object.keys(terms)
    .sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? +1 : -1))
    .filter(term => term.toUpperCase().startsWith(letter))
    .reduce((acc, term) => {
      acc[term] = terms[term]
      return acc
    }, {})
